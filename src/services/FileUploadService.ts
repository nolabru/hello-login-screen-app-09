import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export class FileUploadService {
    /**
     * Faz upload de um arquivo para o Supabase Storage.
     * @param file O arquivo a ser enviado.
     * @param bucket O nome do bucket de destino.
     * @param companyId O ID da empresa para organizar os arquivos.
     * @returns A URL pública do arquivo enviado.
     */
    static async uploadFile(file: File, bucket: string, companyId: string): Promise<string> {
        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = `${companyId}/${fileName}`;

            // Tentar fazer upload para o bucket especificado
            let { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            // Se o bucket não existir, tentar usar o bucket 'profiles' como fallback
            if (uploadError && uploadError.message.includes('Bucket not found')) {
                console.warn(`Bucket '${bucket}' não encontrado, usando bucket 'profiles' como fallback`);

                const fallbackPath = `reports/${companyId}/${fileName}`;
                const { error: fallbackError } = await supabase.storage
                    .from('profiles')
                    .upload(fallbackPath, file);

                if (fallbackError) {
                    throw fallbackError;
                }

                const { data } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(fallbackPath);

                if (!data.publicUrl) {
                    throw new Error('Não foi possível obter a URL pública do arquivo.');
                }

                console.log('✅ FileUploadService: Upload realizado com sucesso no bucket fallback:', data.publicUrl);
                return data.publicUrl;
            }

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            if (!data.publicUrl) {
                throw new Error('Não foi possível obter a URL pública do arquivo.');
            }

            console.log('✅ FileUploadService: Upload realizado com sucesso no bucket principal:', data.publicUrl);
            return data.publicUrl;
        } catch (error) {
            console.error('Erro no upload do arquivo:', error);
            throw error;
        }
    }
}
