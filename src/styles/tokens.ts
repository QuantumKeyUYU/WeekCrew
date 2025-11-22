/* =========================================
   Global Design Tokens for WeekCrew
   Modern, soft, gradient-driven system
   ========================================= */

:root {
  color-scheme: light;

  /* ---- Background ---- */
  --bg-body: radial-gradient(
      circle at 0% 0%,
      #f8faff 0,
      #f4f7ff 28%,
      #eef8ff 52%,
      #f7f5ff 100%
    );

  /* ---- Surfaces ---- */
  --surface-elevated: rgba(255, 255, 255, 0.96);
  --surface-subtle: rgba(255, 255, 255, 0.82);

  /* ---- Borders ---- */
  --border-card: rgba(15, 23, 42, 0.07);
  --border-subtle: rgba(15, 23, 42, 0.09);

  /* ---- Text ---- */
  --text-primary: rgba(20, 26, 38, 0.92);
  --text-secondary: rgba(20, 26, 38, 0.63);

  /* ---- Accent ---- */
  --accent: #4f46e5;
  --accent-soft: rgba(99, 102, 241, 0.12);
  --accent-foreground: #0b1120;

  /* ---- Shadows ---- */
  --shadow-soft: 0 20px 55px rgba(15, 23, 42, 0.08);
  --shadow-card-strong: 0 26px 95px rgba(15, 23, 42, 0.16);
  --shadow-accent: 0 22px 45px rgba(79, 70, 229, 0.45);

  /* ---- Radii ---- */
  --radius-2xl: 1.5rem;
  --radius-3xl: 2.25rem;

  /* ---- Glow ---- */
  --surface-glow: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.86), transparent 55%),
    radial-gradient(circle at 100% 0%, rgba(240, 249, 255, 0.82), transparent 55%),
    radial-gradient(circle at 0% 100%, rgba(244, 244, 255, 0.85), transparent 60%);
}

[data-theme='dark'] {
  color-scheme: dark;

  --bg-body: radial-gradient(
      circle at 0% 0%,
      #020617 0,
      #020617 35%,
      #020617 70%,
      #020617 100%
    );

  --surface-elevated: rgba(15, 23, 42, 0.95);
  --surface-subtle: rgba(15, 23, 42, 0.88);

  --border-card: rgba(148, 163, 184, 0.32);
  --border-subtle: rgba(71, 85, 105, 0.75);

  --text-primary: rgba(248, 250, 252, 0.96);
  --text-secondary: rgba(148, 163, 184, 0.75);

  --accent: #60a5fa;
  --accent-soft: rgba(96, 165, 250, 0.14);
  --accent-foreground: #e5f2ff;

  --shadow-soft: 0 26px 95px rgba(0, 0, 0, 0.85);
  --shadow-card-strong: 0 32px 140px rgba(0, 0, 0, 0.9);
  --shadow-accent: 0 0 55px rgba(96, 165, 250, 0.7);

  --surface-glow: radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.22), transparent 60%),
    radial-gradient(circle at 100% 0%, rgba(45, 212, 191, 0.12), transparent 62%),
    radial-gradient(circle at 40% 120%, rgba(15, 23, 42, 0.9), transparent 70%);
}
