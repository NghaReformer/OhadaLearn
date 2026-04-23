-- Feedback capture: bugs, feature requests, and general feedback.
-- Apply via Supabase SQL editor or `supabase db push`.

create table if not exists public.feedback (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('bug', 'feature', 'other')),
    severity text check (severity in ('low', 'medium', 'high', 'blocker')),
    title text not null,
    description text not null,
    steps text,
    email text,
    screenshot_path text,
    context jsonb not null default '{}'::jsonb,
    status text not null default 'new' check (status in ('new', 'triaged', 'in_progress', 'resolved', 'wont_fix', 'duplicate')),
    created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_type_status_idx on public.feedback (type, status);

alter table public.feedback enable row level security;

-- Writes happen via the server-side service_role client; no public policies.

-- Storage bucket for screenshots. Apply via Supabase dashboard if migration fails.
-- Bucket must be private; screenshots are served via signed URLs from the server.
insert into storage.buckets (id, name, public)
values ('feedback-screenshots', 'feedback-screenshots', false)
on conflict (id) do nothing;
