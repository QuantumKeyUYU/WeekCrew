export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/write', label: 'Поделиться' },
  { href: '/support', label: 'Поддержать' },
  { href: '/my', label: 'Ответы' },
  { href: '/settings', label: 'Настройки' }
];

export const EXPERIMENT_LINKS: NavItem[] = [
  { href: '/explore', label: 'Эксперименты: интересы' },
  { href: '/circle', label: 'Эксперименты: кружки' }
];
