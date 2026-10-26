-- Local, unapplied contract migration for the PCG.OS source adapter.
-- This file intentionally does not create tables, users, policies, or data.
-- The remote PCG.OS.v2 schema already contains the target tables and RLS.
-- Apply only after the remote schema has been pulled and reconciled through
-- the Supabase CLI/MCP in an approved environment.

do $$
declare
  required_table text;
begin
  foreach required_table in array array[
    'organizations',
    'organization_memberships',
    'member_permissions',
    'clients',
    'client_private_data',
    'client_record_entries',
    'matters',
    'matter_parties',
    'matter_party_private_data',
    'matter_record_entries',
    'deadlines',
    'events',
    'transactions',
    'audit_events'
  ] loop
    if to_regclass(format('public.%s', required_table)) is null then
      raise exception 'PCG.OS Supabase contract is missing public.%', required_table;
    end if;
  end loop;
end
$$;

-- Source-to-Supabase mapping recorded for the adapter implementation:
-- users/authentication -> auth.users + public.organization_memberships
-- clients/CRM -> public.clients + public.client_private_data + public.client_record_entries
-- processes/cases -> public.matters + public.matter_parties + private data/entries
-- deadlines -> public.deadlines
-- events/agenda -> public.events
-- transactions/finance -> public.transactions
-- audit logs -> public.audit_events
-- teams/settings/permissions -> organization membership and permission model;
--   no source fixture or database.json row is copied by this contract.
