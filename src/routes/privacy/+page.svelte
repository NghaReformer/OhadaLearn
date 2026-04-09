<script lang="ts">
  import { t } from '$lib/i18n';
</script>

<svelte:head>
  <title>Privacy Policy — OhadaLearn</title>
</svelte:head>

<section class="privacy container">
  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: April 2026</p>

  <h2>What we collect</h2>
  <p>When you join our waitlist, we collect: your name, email address, institution (optional), and role. This data is stored securely on Supabase (AWS EU region) and used only to notify you about OhadaLearn updates.</p>

  <h2>Analytics</h2>
  <p>We use Umami, a privacy-respecting analytics tool that collects no personal data and uses no cookies. We see page views and visit counts — not who you are.</p>

  <h2>No cookies</h2>
  <p>This site does not use cookies. Your language and currency preferences are stored in your browser's localStorage and never sent to our servers.</p>

  <h2>Your rights</h2>
  <p>You can request deletion of your waitlist data at any time by contacting us. We will remove your information within 7 days.</p>

  <h2>Contact</h2>
  <p>For privacy questions, reach out via our institutional channels.</p>
</section>

<style>
  .privacy {
    max-width: 680px;
    padding: 3rem 1.5rem;
  }

  h1 { margin-bottom: 0.5rem; }
  h2 { margin-top: 2rem; margin-bottom: 0.5rem; font-size: 1.2rem; }
  p { color: var(--text-secondary); line-height: 1.8; }
  .updated { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem; }
</style>
