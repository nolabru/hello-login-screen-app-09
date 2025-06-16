import React from "react";
import { UseFormReturn } from "react-hook-form";
import { UserProfileFormData, GENDER_OPTIONS, AGE_RANGE_OPTIONS, AIA_OBJECTIVES_OPTIONS, MENTAL_HEALTH_EXPERIENCE_OPTIONS } from "./UserProfileFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface UserProfileFormFieldsProps {
  form: UseFormReturn<UserProfileFormData>;
}

export const UserProfileFormFields: React.FC<UserProfileFormFieldsProps> = ({
  form,
}) => {

  return (
    <div className="space-y-6">
      {/* Nome */}
      <FormField
        control={form.control}
        name="preferred_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input
                placeholder="Seu nome"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Gênero */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gênero *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Faixa Etária */}
      <FormField
        control={form.control}
        name="age_range"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Faixa Etária *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua faixa etária" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {AGE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Objetivos com a IA */}
      <FormField
        control={form.control}
        name="aia_objectives"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Como a IA pode te ajudar? *</FormLabel>
              <p className="text-sm text-muted-foreground">
                Selecione uma ou mais opções
              </p>
            </div>
            <div className="space-y-3">
              {AIA_OBJECTIVES_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="aia_objectives"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.value])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== option.value
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Experiência com Saúde Mental */}
      <FormField
        control={form.control}
        name="mental_health_experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qual sua experiência com saúde mental? *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua experiência" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MENTAL_HEALTH_EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
