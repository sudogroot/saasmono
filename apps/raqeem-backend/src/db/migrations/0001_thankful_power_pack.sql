ALTER TABLE "cases" DROP CONSTRAINT "cases_org_case_number_unique";--> statement-breakpoint
ALTER TABLE "trials" DROP CONSTRAINT "trials_case_trial_number_unique";--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_org_case_number_unique" UNIQUE("organization_id","case_number","deleted_at");--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_org_national_id_unique" UNIQUE("organization_id","national_id","deleted_at");--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_case_trial_number_unique" UNIQUE("case_id","trial_number","deleted_at");