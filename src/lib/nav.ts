export interface NavItem {
  label:    string;
  href:     string;
  icon:     string; // SVG path data
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href:  '/',
        icon:  'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Members',
        href:  '/members',
        icon:  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Log Contribution',
        href:  '/contribute',
        icon:  'M12 5v14M5 12h14',
      },
      {
        label: 'Contributions',
        href:  '/contributions',
        icon:  'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9z',
      },
      {
        label: 'Reconciliation',
        href:  '/reconciliation',
        icon:  'M22 12h-4l-3 9L9 3l-3 9H2',
      },
    ],
  },
  {
    title: 'Records',
    items: [
      {
        label: 'Audit Trail',
        href:  '/audit',
        icon:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      },
      {
        label: 'Export Reports',
        href:  '/export',
        icon:  'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
      },
    ],
  },
];

// Page titles and subtitles shown in the topbar
export const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/':               { title: 'Dashboard',        subtitle: 'Overview of your savings group'     },
  '/members':        { title: 'Members',           subtitle: 'Manage group members'               },
  '/contribute':     { title: 'Log Contribution',  subtitle: 'Record a payment via web form'      },
  '/contributions':  { title: 'Contributions',     subtitle: 'View all contribution records'      },
  '/reconciliation': { title: 'Reconciliation',    subtitle: 'Group health and balance checks'    },
  '/audit':          { title: 'Audit Trail',        subtitle: 'Tamper-evident cryptographic records'},
  '/export':         { title: 'Export Reports',    subtitle: 'Download verifiable financial reports'},
};