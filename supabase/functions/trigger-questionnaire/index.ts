import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('Trigger questionnaire function initialized');

serve(async (req) => {
    try {
        const { questionnaireId, targetDepartments } = await req.json();

        if (!questionnaireId) {
            throw new Error('questionnaireId is required');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // 1. Get company information using the mapping view
        const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('questionnaire_user_mapping')
            .select('auth_user_id, company_uuid')
            .eq('questionnaire_id', questionnaireId)
            .single();

        if (questionnaireError) throw questionnaireError;
        const authUserId = questionnaireData.auth_user_id;
        const companyUuid = questionnaireData.company_uuid;

        // 2. Get users to notify using the correct company_uuid
        let query = supabase
            .from('user_profiles')
            .select('user_id, fcm_token')
            .eq('company_id', companyUuid);

        if (targetDepartments && targetDepartments.length > 0) {
            query = query.in('department', targetDepartments);
        }

        const { data: users, error: usersError } = await query;
        if (usersError) throw usersError;

        if (!users || users.length === 0) {
            return new Response(JSON.stringify({ message: 'No users found to notify.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 3. Prepare notifications
        const notifications = users.map(user => ({
            user_id: user.user_id,
            questionnaire_id: questionnaireId,
            company_id: authUserId, // Use auth_user_id for notifications table
            notification_type: 'new_questionnaire',
            scheduled_at: new Date().toISOString(),
            status: 'pending',
        }));

        // 4. Insert notifications
        const { error: insertError } = await supabase
            .from('questionnaire_notifications')
            .insert(notifications);

        if (insertError) throw insertError;

        // 5. (Optional) Update questionnaire status
        await supabase
            .from('questionnaires')
            .update({ notification_sent: true, status: 'active' })
            .eq('id', questionnaireId);

        // 6. (Future) Send push notifications
        const usersWithTokens = users.filter(user => user.fcm_token);
        if (usersWithTokens.length > 0) {
            console.log(`Found ${usersWithTokens.length} users with FCM tokens for future push notification implementation`);
            // TODO: Implement FCM push notification sending here
            // Example: await sendFCMNotification(usersWithTokens, questionnaireTitle, questionnaireId);
        }

        return new Response(JSON.stringify({
            message: `Successfully created ${notifications.length} notifications.`,
            users_with_tokens: usersWithTokens.length
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in trigger-questionnaire function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
