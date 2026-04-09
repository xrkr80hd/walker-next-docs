-- 006 — Rename fna → fni

update public.profiles set role = 'fni' where role = 'fna';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'user', 'fni'));

update public.invites set role = 'fni' where role = 'fna';
alter table public.invites drop constraint if exists invites_role_check;
alter table public.invites add constraint invites_role_check check (role in ('admin', 'user', 'fni'));

update public.notifications set recipient_role = 'fni' where recipient_role = 'fna';
alter table public.notifications drop constraint if exists notifications_recipient_role_check;
alter table public.notifications add constraint notifications_recipient_role_check check (recipient_role in ('admin', 'user', 'fni'));

drop policy if exists "FNA read fni-ready deals" on public.deals;
create policy "FNI read fni-ready deals"
  on public.deals for select
  using (fni_ready = true and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'fni'
  ));
