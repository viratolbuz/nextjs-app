// ========== TYPES ==========
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  projects: number;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  phone?: string;
  department?: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  channels: string[];
  status: 'Connected' | 'Disconnected' | 'Expiring';
  projects: number;
  spendMTD: string;
  avgROAS: string;
  color: string;
  tokenExpiry?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  platforms: string[];
  manager: string;
  budget: string;
  budgetUsed: number;
  status: 'Active' | 'On Hold' | 'Completed' | 'Budget Warning';
  spend: string;
  revenue: string;
  leads: number;
  cpl: string;
  roas: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceEntry {
  id: string;
  date: string;
  project: string;
  platform: string;
  spend: number;
  leads: number;
  cpl: number;
  revenue: number;
  roas: number;
}

export interface Role {
  id: string;
  name: string;
  type: 'System' | 'Custom';
  userCount: number;
  permissions: Record<string, 'Full' | 'View' | 'None'>;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
}

// ========== MOCK DATA ==========

/** Canonical UI order for roles (Super Admin → … → Client) */
export const ROLE_DISPLAY_ORDER = ['Super Admin', 'Admin', 'Manager', 'User', 'Client'] as const;

export function sortRolesByDisplayOrder<T extends { name: string }>(list: T[]): T[] {
  const order = ROLE_DISPLAY_ORDER as unknown as string[];
  return [...list].sort((a, b) => {
    const ia = order.indexOf(a.name);
    const ib = order.indexOf(b.name);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

export const users: User[] = [
  { id: '1', name: 'Super Admin', email: 'super-admin@adtorise.com', role: 'Super Admin', avatar: 'SA', projects: 54, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43210', department: 'Administration' },
  { id: '2', name: 'Amit Mehta', email: 'amit.mehta@adtorise.com', role: 'Admin', avatar: 'AM', projects: 12, status: 'Active', lastLogin: '08:42', phone: '+91 98765 43211', department: 'Administration' },
  { id: '3', name: 'Priya Sharma', email: 'priya.s@adtorise.com', role: 'Manager', avatar: 'PS', projects: 8, status: 'Active', lastLogin: 'Yesterday', phone: '+91 98765 43212', department: 'Management' },
  { id: '4', name: 'Rahul Kumar', email: 'rahul.k@adtorise.com', role: 'User', avatar: 'RK', projects: 6, status: 'Active', lastLogin: 'Mar 29', phone: '+91 98765 43213', department: 'Operations' },
  { id: '5', name: 'Sneha Joshi', email: 'sneha.j@adtorise.com', role: 'Client', avatar: 'SJ', projects: 7, status: 'Inactive', lastLogin: 'Mar 10', phone: '+91 98765 43214', department: 'Client' },
  { id: '6', name: 'Vikram Nair', email: 'vikram.n@adtorise.com', role: 'Manager', avatar: 'VN', projects: 9, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43215', department: 'Management' },
  { id: '7', name: 'Ananya Patel', email: 'ananya.p@adtorise.com', role: 'Manager', avatar: 'AP', projects: 5, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43216', department: 'Management' },
  { id: '8', name: 'Karan Singh', email: 'karan.s@adtorise.com', role: 'Admin', avatar: 'KS', projects: 10, status: 'Active', lastLogin: 'Yesterday', phone: '+91 98765 43217', department: 'Administration' },
  { id: '9', name: 'Meera Reddy', email: 'meera.r@adtorise.com', role: 'User', avatar: 'MR', projects: 4, status: 'Pending', lastLogin: 'Never', phone: '+91 98765 43218', department: 'Operations' },
  { id: '10', name: 'Arjun Desai', email: 'arjun.d@adtorise.com', role: 'Client', avatar: 'AD', projects: 6, status: 'Active', lastLogin: 'Mar 30', phone: '+91 98765 43219', department: 'Client' },
  { id: '11', name: 'Pooja Verma', email: 'pooja.v@adtorise.com', role: 'Manager', avatar: 'PV', projects: 8, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43220', department: 'Management' },
  { id: '12', name: 'Ravi Gupta', email: 'ravi.g@adtorise.com', role: 'Client', avatar: 'RG', projects: 3, status: 'Inactive', lastLogin: 'Feb 20', phone: '+91 98765 43221', department: 'Client' },
  { id: '13', name: 'Divya Iyer', email: 'divya.i@adtorise.com', role: 'User', avatar: 'DI', projects: 5, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43222', department: 'Operations' },
  { id: '14', name: 'Nikhil Jain', email: 'nikhil.j@adtorise.com', role: 'Client', avatar: 'NJ', projects: 7, status: 'Active', lastLogin: 'Yesterday', phone: '+91 98765 43223', department: 'Client' },
  { id: '15', name: 'Sanya Malhotra', email: 'sanya.m@adtorise.com', role: 'Admin', avatar: 'SM', projects: 11, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43224', department: 'Administration' },
  { id: '16', name: 'Tarun Bhat', email: 'tarun.b@adtorise.com', role: 'Manager', avatar: 'TB', projects: 4, status: 'Active', lastLogin: 'Mar 28', phone: '+91 98765 43225', department: 'Management' },
  { id: '17', name: 'Ishita Chopra', email: 'ishita.c@adtorise.com', role: 'User', avatar: 'IC', projects: 3, status: 'Pending', lastLogin: 'Never', phone: '+91 98765 43226', department: 'Operations' },
  { id: '18', name: 'Manish Tiwari', email: 'manish.t@adtorise.com', role: 'Client', avatar: 'MT', projects: 6, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43227', department: 'Client' },
  { id: '19', name: 'Kavita Rao', email: 'kavita.r@adtorise.com', role: 'Manager', avatar: 'KR', projects: 7, status: 'Active', lastLogin: 'Yesterday', phone: '+91 98765 43228', department: 'Management' },
  { id: '20', name: 'Deepak Pandey', email: 'deepak.p@adtorise.com', role: 'Client', avatar: 'DP', projects: 5, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43229', department: 'Client' },
  { id: '21', name: 'Shruti Nayak', email: 'shruti.n@adtorise.com', role: 'Client', avatar: 'SN', projects: 4, status: 'Active', lastLogin: 'Mar 31', phone: '+91 98765 43230', department: 'Client' },
  { id: '22', name: 'Varun Saxena', email: 'varun.s@adtorise.com', role: 'User', avatar: 'VS', projects: 3, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43231', department: 'Operations' },
  { id: '23', name: 'Neha Kulkarni', email: 'neha.k@adtorise.com', role: 'Client', avatar: 'NK', projects: 5, status: 'Active', lastLogin: 'Yesterday', phone: '+91 98765 43232', department: 'Client' },
  { id: '24', name: 'Rohit Agarwal', email: 'rohit.a@adtorise.com', role: 'Admin', avatar: 'RA', projects: 9, status: 'Active', lastLogin: 'Today', phone: '+91 98765 43233', department: 'Administration' },
];

export const platforms: Platform[] = [
  { id: '1', name: 'Google Ads', icon: 'G', channels: ['Search', 'Display', 'Shopping', 'YouTube'], status: 'Connected', projects: 28, spendMTD: '₹22.4L', avgROAS: '4.2x', color: 'hsl(var(--chart-1))' },
  { id: '2', name: 'Meta Ads', icon: 'f', channels: ['Facebook', 'Instagram', 'Messenger'], status: 'Connected', projects: 18, spendMTD: '₹16.8L', avgROAS: '3.6x', color: 'hsl(var(--chart-2))' },
  { id: '3', name: 'Bing Ads', icon: 'b', channels: ['Microsoft Search', 'Audience'], status: 'Expiring', projects: 6, spendMTD: '₹5.9L', avgROAS: '2.8x', color: 'hsl(var(--chart-3))', tokenExpiry: '2 days' },
];

export const projects: Project[] = [
  { id: '1', name: 'AIIM', client: 'AIIM Institute', type: 'Education', platforms: ['Google Ads', 'Meta Ads'], manager: 'Amit Mehta', budget: '₹35L', budgetUsed: 82, status: 'Active', spend: '₹33.5L', revenue: '₹134.0L', leads: 8840, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '2', name: 'Alfa Pumps', client: 'Alfa Industries', type: 'Industrial', platforms: ['Google Ads'], manager: 'Priya Sharma', budget: '₹3L', budgetUsed: 65, status: 'Active', spend: '₹2.2L', revenue: '₹8.9L', leads: 590, cpl: '₹380', roas: '3.93x', country: 'India', createdAt: '2025-06-15', updatedAt: '2026-04-01' },
  { id: '3', name: 'Ample Mods', client: 'Ample Tech', type: 'Technology', platforms: ['Google Ads', 'Meta Ads'], manager: 'Vikram Nair', budget: '₹10L', budgetUsed: 72, status: 'Active', spend: '₹8.0L', revenue: '₹32.1L', leads: 2120, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-05-10', updatedAt: '2026-04-01' },
  { id: '4', name: 'Avocats Services', client: 'Avocats Legal', type: 'Legal', platforms: ['Google Ads'], manager: 'Rahul Kumar', budget: '₹3L', budgetUsed: 55, status: 'Active', spend: '₹2.4L', revenue: '₹9.7L', leads: 640, cpl: '₹381', roas: '4.0x', country: 'India', createdAt: '2025-07-01', updatedAt: '2026-04-01' },
  { id: '5', name: 'Berks', client: 'Berks Holdings', type: 'Real Estate', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Amit Mehta', budget: '₹120L', budgetUsed: 88, status: 'Budget Warning', spend: '₹109.2L', revenue: '₹436.7L', leads: 28800, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '6', name: 'Bonzer Marketers', client: 'Bonzer Digital', type: 'Marketing', platforms: ['Meta Ads'], manager: 'Ananya Patel', budget: '₹1L', budgetUsed: 15, status: 'Active', spend: '₹0.17L', revenue: '₹0.67L', leads: 44, cpl: '₹382', roas: '4.0x', country: 'India', createdAt: '2026-01-15', updatedAt: '2026-04-01' },
  { id: '7', name: 'Botnia', client: 'Botnia Skincare', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Priya Sharma', budget: '₹20L', budgetUsed: 78, status: 'Active', spend: '₹17.0L', revenue: '₹68.2L', leads: 4500, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '8', name: 'Buy Mobile AU', client: 'Buy Mobile Pty', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Karan Singh', budget: '₹30L', budgetUsed: 80, status: 'Budget Warning', spend: '₹26.3L', revenue: '₹105.0L', leads: 6920, cpl: '₹380', roas: '4.0x', country: 'Australia', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '9', name: 'Buy Mobile NZ', client: 'Buy Mobile NZ Ltd', type: 'E-Commerce', platforms: ['Google Ads'], manager: 'Karan Singh', budget: '₹6L', budgetUsed: 75, status: 'Budget Warning', spend: '₹5.3L', revenue: '₹21.1L', leads: 1390, cpl: '₹380', roas: '4.0x', country: 'New Zealand', createdAt: '2025-05-01', updatedAt: '2026-04-01' },
  { id: '10', name: 'Charging Cable', client: 'Charging Cable Co', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Pooja Verma', budget: '₹2L', budgetUsed: 52, status: 'Budget Warning', spend: '₹1.2L', revenue: '₹4.8L', leads: 315, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-06-01', updatedAt: '2026-04-01' },
  { id: '11', name: 'Cheap SSL Shop', client: 'SSL Solutions', type: 'Technology', platforms: ['Google Ads', 'Bing Ads'], manager: 'Vikram Nair', budget: '₹50L', budgetUsed: 82, status: 'Active', spend: '₹44.8L', revenue: '₹179.1L', leads: 11800, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '12', name: 'Confiance', client: 'Confiance Solutions', type: 'Technology', platforms: ['Google Ads'], manager: 'Sanya Malhotra', budget: '₹4L', budgetUsed: 72, status: 'Budget Warning', spend: '₹3.3L', revenue: '₹13.4L', leads: 882, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '13', name: 'Covermagix', client: 'Covermagix Pvt', type: 'E-Commerce', platforms: ['Meta Ads'], manager: 'Tarun Bhat', budget: '₹1L', budgetUsed: 38, status: 'Budget Warning', spend: '₹0.44L', revenue: '₹1.7L', leads: 115, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '14', name: 'Cuff Essentials', client: 'Cuff Fashion', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Ananya Patel', budget: '₹28L', budgetUsed: 82, status: 'Active', spend: '₹25.3L', revenue: '₹101.3L', leads: 6680, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '15', name: 'D Artists', client: 'D Artists Studio', type: 'Creative', platforms: ['Google Ads', 'Meta Ads'], manager: 'Priya Sharma', budget: '₹35L', budgetUsed: 79, status: 'Active', spend: '₹30.3L', revenue: '₹121.3L', leads: 7990, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '16', name: 'Direct Care', client: 'Direct Care Health', type: 'Healthcare', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Amit Mehta', budget: '₹60L', budgetUsed: 84, status: 'Active', spend: '₹55.0L', revenue: '₹220.2L', leads: 14520, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '17', name: 'Empere', client: 'Empere Lifestyle', type: 'E-Commerce', platforms: ['Google Ads'], manager: 'Vikram Nair', budget: '₹5L', budgetUsed: 78, status: 'Active', spend: '₹4.5L', revenue: '₹17.8L', leads: 1175, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '18', name: 'Fort Dental', client: 'Fort Dental Clinic', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Rahul Kumar', budget: '₹1L', budgetUsed: 8, status: 'Budget Warning', spend: '₹0.08L', revenue: '₹0.34L', leads: 22, cpl: '₹385', roas: '4.0x', country: 'India', createdAt: '2025-08-01', updatedAt: '2026-04-01' },
  { id: '19', name: 'Gotablo', client: 'Gotablo Tech', type: 'Technology', platforms: ['Google Ads', 'Meta Ads'], manager: 'Karan Singh', budget: '₹14L', budgetUsed: 76, status: 'Budget Warning', spend: '₹11.8L', revenue: '₹47.2L', leads: 3100, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '20', name: 'Grit & Flair', client: 'Grit & Flair Co', type: 'Creative', platforms: ['Google Ads', 'Meta Ads'], manager: 'Pooja Verma', budget: '₹28L', budgetUsed: 78, status: 'Budget Warning', spend: '₹24.0L', revenue: '₹96.1L', leads: 6340, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '21', name: "Massu's", client: "Massu's Kitchen", type: 'F&B', platforms: ['Google Ads', 'Meta Ads'], manager: 'Ananya Patel', budget: '₹5L', budgetUsed: 78, status: 'Budget Warning', spend: '₹4.5L', revenue: '₹17.9L', leads: 1184, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '22', name: 'Helios Orthojoint', client: 'Helios Medical', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Rahul Kumar', budget: '₹2L', budgetUsed: 75, status: 'Active', spend: '₹1.7L', revenue: '₹6.9L', leads: 452, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-06-01', updatedAt: '2026-04-01' },
  { id: '23', name: 'HRX', client: 'HRX Fitness', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Sanya Malhotra', budget: '₹35L', budgetUsed: 85, status: 'Budget Warning', spend: '₹32.4L', revenue: '₹129.6L', leads: 8540, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '24', name: 'Icosano', client: 'Icosano Biotech', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Vikram Nair', budget: '₹10L', budgetUsed: 82, status: 'Active', spend: '₹9.0L', revenue: '₹35.9L', leads: 2364, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '25', name: "Kalyan Women's Hospital", client: 'Kalyan Healthcare', type: 'Healthcare', platforms: ['Google Ads', 'Meta Ads'], manager: 'Priya Sharma', budget: '₹4L', budgetUsed: 78, status: 'Active', spend: '₹3.5L', revenue: '₹13.9L', leads: 914, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-05-01', updatedAt: '2026-04-01' },
  { id: '26', name: 'Launch Car Scanner', client: 'Launch Diagnostics', type: 'Automotive', platforms: ['Google Ads'], manager: 'Karan Singh', budget: '₹5L', budgetUsed: 68, status: 'Active', spend: '₹3.9L', revenue: '₹15.7L', leads: 1035, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '27', name: 'Link Publishers', client: 'Link Media', type: 'Publishing', platforms: ['Google Ads', 'Meta Ads'], manager: 'Tarun Bhat', budget: '₹9L', budgetUsed: 80, status: 'Budget Warning', spend: '₹7.8L', revenue: '₹31.4L', leads: 2066, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '28', name: 'Lotus Lifestyle', client: 'Lotus Group', type: 'Real Estate', platforms: ['Google Ads', 'Meta Ads'], manager: 'Rohit Agarwal', budget: '₹4L', budgetUsed: 82, status: 'Active', spend: '₹3.7L', revenue: '₹14.7L', leads: 970, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '29', name: 'Menu Ads', client: 'Menu Digital', type: 'Marketing', platforms: ['Meta Ads'], manager: 'Ananya Patel', budget: '₹0.1L', budgetUsed: 4, status: 'Budget Warning', spend: '₹0.004L', revenue: '₹0.02L', leads: 1, cpl: '₹425', roas: '4.0x', country: 'India', createdAt: '2026-02-01', updatedAt: '2026-04-01' },
  { id: '30', name: 'Mithila Burn Center', client: 'Mithila Hospital', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Rahul Kumar', budget: '₹1L', budgetUsed: 42, status: 'Budget Warning', spend: '₹0.5L', revenue: '₹2.0L', leads: 134, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-07-01', updatedAt: '2026-04-01' },
  { id: '31', name: 'Next Store', client: 'Next Retail', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Amit Mehta', budget: '₹62L', budgetUsed: 85, status: 'Active', spend: '₹57.3L', revenue: '₹229.1L', leads: 15090, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '32', name: 'Nihar Netralaya', client: 'Nihar Eye Care', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Priya Sharma', budget: '₹3L', budgetUsed: 60, status: 'Active', spend: '₹2.1L', revenue: '₹8.2L', leads: 542, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '33', name: 'NX Villa', client: 'NX Properties', type: 'Real Estate', platforms: ['Google Ads', 'Meta Ads'], manager: 'Vikram Nair', budget: '₹4L', budgetUsed: 78, status: 'Active', spend: '₹3.5L', revenue: '₹13.8L', leads: 910, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '34', name: 'Olzam', client: 'Olzam Global', type: 'Technology', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Karan Singh', budget: '₹50L', budgetUsed: 85, status: 'Active', spend: '₹46.6L', revenue: '₹186.5L', leads: 12290, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '35', name: 'Olavl', client: 'Olavl Wellness', type: 'Healthcare', platforms: ['Google Ads', 'Meta Ads'], manager: 'Pooja Verma', budget: '₹30L', budgetUsed: 80, status: 'Budget Warning', spend: '₹26.2L', revenue: '₹104.6L', leads: 6900, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '36', name: 'Panchamrut Skyz', client: 'Panchamrut Realty', type: 'Real Estate', platforms: ['Google Ads'], manager: 'Sanya Malhotra', budget: '₹1L', budgetUsed: 38, status: 'Budget Warning', spend: '₹0.42L', revenue: '₹1.7L', leads: 112, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-09-01', updatedAt: '2026-04-01' },
  { id: '37', name: 'Parisar 80', client: 'Parisar Developers', type: 'Real Estate', platforms: ['Google Ads'], manager: 'Rohit Agarwal', budget: '₹1L', budgetUsed: 38, status: 'Budget Warning', spend: '₹0.42L', revenue: '₹1.7L', leads: 112, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-09-01', updatedAt: '2026-04-01' },
  { id: '38', name: 'Parkview Prism', client: 'Parkview Realty', type: 'Real Estate', platforms: ['Google Ads', 'Meta Ads'], manager: 'Tarun Bhat', budget: '₹5L', budgetUsed: 68, status: 'Active', spend: '₹3.9L', revenue: '₹15.5L', leads: 1020, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '39', name: 'Plants World', client: 'Plants World Pvt', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Ananya Patel', budget: '₹18L', budgetUsed: 78, status: 'Budget Warning', spend: '₹15.6L', revenue: '₹62.4L', leads: 4116, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '40', name: 'Proshare', client: 'Proshare Finance', type: 'Finance', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Amit Mehta', budget: '₹48L', budgetUsed: 80, status: 'Active', spend: '₹42.0L', revenue: '₹168.1L', leads: 11080, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '41', name: 'Puja IVF Clinic', client: 'Puja Healthcare', type: 'Healthcare', platforms: ['Google Ads'], manager: 'Priya Sharma', budget: '₹7L', budgetUsed: 75, status: 'Active', spend: '₹5.9L', revenue: '₹23.4L', leads: 1544, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '42', name: 'Riverway NX', client: 'Riverway Properties', type: 'Real Estate', platforms: ['Google Ads'], manager: 'Vikram Nair', budget: '₹1L', budgetUsed: 68, status: 'Active', spend: '₹0.76L', revenue: '₹3.1L', leads: 202, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '43', name: 'Segal Lifestyle', client: 'Segal Group', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads'], manager: 'Karan Singh', budget: '₹4L', budgetUsed: 68, status: 'Active', spend: '₹3.1L', revenue: '₹12.3L', leads: 810, cpl: '₹380', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '44', name: 'Squareroot', client: 'Squareroot Tech', type: 'Technology', platforms: ['Google Ads', 'Meta Ads'], manager: 'Pooja Verma', budget: '₹18L', budgetUsed: 78, status: 'Active', spend: '₹15.4L', revenue: '₹61.4L', leads: 4048, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '45', name: 'Srees Tours', client: 'Srees Travel', type: 'Travel', platforms: ['Google Ads'], manager: 'Sanya Malhotra', budget: '₹0.5L', budgetUsed: 8, status: 'Budget Warning', spend: '₹0.04L', revenue: '₹0.16L', leads: 11, cpl: '₹381', roas: '4.0x', country: 'India', createdAt: '2025-10-01', updatedAt: '2026-04-01' },
  { id: '46', name: 'SSL2Buy', client: 'SSL2Buy Inc', type: 'Technology', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Rohit Agarwal', budget: '₹50L', budgetUsed: 82, status: 'Active', spend: '₹44.9L', revenue: '₹179.5L', leads: 11830, cpl: '₹379', roas: '4.0x', country: 'USA', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '47', name: 'Thermista', client: 'Thermista HVAC', type: 'Industrial', platforms: ['Google Ads'], manager: 'Tarun Bhat', budget: '₹2L', budgetUsed: 82, status: 'Active', spend: '₹1.9L', revenue: '₹7.5L', leads: 497, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-06-01', updatedAt: '2026-04-01' },
  { id: '48', name: 'TitSpy', client: 'TitSpy Analytics', type: 'Technology', platforms: ['Google Ads', 'Meta Ads'], manager: 'Amit Mehta', budget: '₹45L', budgetUsed: 82, status: 'Active', spend: '₹40.4L', revenue: '₹161.8L', leads: 10660, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '49', name: 'Tools4Trade', client: 'Tools4Trade Ltd', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Karan Singh', budget: '₹140L', budgetUsed: 82, status: 'Active', spend: '₹124.4L', revenue: '₹497.8L', leads: 32810, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '50', name: 'Trupply', client: 'Trupply Supply', type: 'E-Commerce', platforms: ['Google Ads', 'Meta Ads', 'Bing Ads'], manager: 'Priya Sharma', budget: '₹95L', budgetUsed: 82, status: 'Active', spend: '₹86.3L', revenue: '₹345.4L', leads: 22770, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '51', name: 'V3Cube', client: 'V3Cube Solutions', type: 'Technology', platforms: ['Google Ads', 'Meta Ads'], manager: 'Vikram Nair', budget: '₹12L', budgetUsed: 80, status: 'Active', spend: '₹10.98L', revenue: '₹43.9L', leads: 2896, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '52', name: 'Watermain Supply', client: 'Watermain Holdings', type: 'Industrial', platforms: ['Google Ads', 'Meta Ads'], manager: 'Pooja Verma', budget: '₹30L', budgetUsed: 82, status: 'Active', spend: '₹27.3L', revenue: '₹109.2L', leads: 7200, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '53', name: 'Zee Overseas', client: 'Zee Global', type: 'Import/Export', platforms: ['Google Ads', 'Meta Ads'], manager: 'Sanya Malhotra', budget: '₹22L', budgetUsed: 80, status: 'Active', spend: '₹19.5L', revenue: '₹78.2L', leads: 5154, cpl: '₹379', roas: '4.0x', country: 'India', createdAt: '2025-04-01', updatedAt: '2026-04-01' },
  { id: '54', name: 'Zynex', client: 'Zynex Digital', type: 'Technology', platforms: ['Meta Ads'], manager: 'Rohit Agarwal', budget: '₹0.1L', budgetUsed: 0, status: 'Budget Warning', spend: '₹0L', revenue: '₹0L', leads: 0, cpl: '₹0', roas: '0x', country: 'India', createdAt: '2026-03-01', updatedAt: '2026-04-01' },
];

export const performanceEntries: PerformanceEntry[] = [
  { id: '1', date: '01 Apr', project: 'Prestige Fields', platform: 'Google Ads', spend: 48200, leads: 128, cpl: 376, revenue: 192000, roas: 3.98 },
  { id: '2', date: '01 Apr', project: 'Brigade Orchards', platform: 'Meta Ads', spend: 32500, leads: 96, cpl: 338, revenue: 136800, roas: 4.21 },
  { id: '3', date: '01 Apr', project: 'Lodha Palava Phase 3', platform: 'Bing Ads', spend: 18900, leads: 44, cpl: 429, revenue: 72400, roas: 3.83 },
  { id: '4', date: '31 Mar', project: 'Sobha Acres', platform: 'Google Ads', spend: 41600, leads: 110, cpl: 378, revenue: 174200, roas: 4.19 },
  { id: '5', date: '31 Mar', project: 'DLF Midtown Gurgaon', platform: 'Meta Ads', spend: 28400, leads: 78, cpl: 364, revenue: 112000, roas: 3.94 },
  { id: '6', date: '31 Mar', project: 'Godrej Reserve', platform: 'Google Ads', spend: 35200, leads: 92, cpl: 383, revenue: 148400, roas: 4.22 },
  { id: '7', date: '30 Mar', project: 'Manipal Health', platform: 'Meta Ads', spend: 22100, leads: 62, cpl: 356, revenue: 88400, roas: 4.0 },
  { id: '8', date: '30 Mar', project: 'BITS Pilani Admissions', platform: 'Google Ads', spend: 15600, leads: 48, cpl: 325, revenue: 62400, roas: 4.0 },
  { id: '9', date: '30 Mar', project: 'Prestige Fields', platform: 'Meta Ads', spend: 38900, leads: 104, cpl: 374, revenue: 155600, roas: 4.0 },
  { id: '10', date: '29 Mar', project: 'Tata La Vida', platform: 'Google Ads', spend: 19800, leads: 52, cpl: 381, revenue: 79200, roas: 4.0 },
  { id: '11', date: '29 Mar', project: 'Brigade Orchards', platform: 'Google Ads', spend: 27300, leads: 74, cpl: 369, revenue: 109200, roas: 4.0 },
  { id: '12', date: '29 Mar', project: 'Mahindra Eden', platform: 'Meta Ads', spend: 21500, leads: 58, cpl: 371, revenue: 86000, roas: 4.0 },
];

export const roles: Role[] = [
  { id: '4', name: 'Super Admin', type: 'System', userCount: 1, permissions: {
    View_dashboard: 'Full', Manage_dashboard: 'Full', View_users: 'Full', Create_users: 'Full', Edit_users: 'Full', Delete_users: 'Full',
    View_roles: 'Full', Create_roles: 'Full', Edit_roles: 'Full', Delete_roles: 'Full',
    View_projects: 'Full', Create_projects: 'Full', Edit_projects: 'Full', Delete_projects: 'Full',
    View_platforms: 'Full', Edit_platforms: 'Full', Delete_platforms: 'Full',
    View_performance_entries: 'Full', Create_performance_entries: 'Full', Edit_performance_entries: 'Full', Delete_performance_entries: 'Full',
    Team_spend: 'Full', Spend_chart: 'Full', Monthly_spend: 'Full', Quarterly_spend: 'Full',
    Team_spend_report: 'Full', Spend_chart_report: 'Full', Project_spend_report: 'Full',
    View_reports: 'Full', Platform_spend_report: 'Full',
    Export_performance_entries: 'Full', Import_performance_entries: 'Full', View_email_histories: 'Full'
  }},
  { id: '1', name: 'Admin', type: 'System', userCount: 2, permissions: {
    View_dashboard: 'Full', View_users: 'Full', Create_users: 'Full', Edit_users: 'Full', Delete_users: 'None', View_roles: 'Full', Create_roles: 'Full', Edit_roles: 'Full',
    View_projects: 'Full', Create_projects: 'Full', Edit_projects: 'Full', Delete_projects: 'Full', View_platforms: 'Full',
    View_performance_entries: 'Full', Create_performance_entries: 'Full', Edit_performance_entries: 'Full', Delete_performance_entries: 'Full',
    Team_spend: 'Full', Spend_chart: 'Full', Monthly_spend: 'Full', Team_spend_report: 'Full', Spend_chart_report: 'Full',
    Project_spend_report: 'Full', Quarterly_spend_report: 'Full', View_reports: 'Full', Platform_spend_report: 'Full',
    Export_performance_entries: 'Full', Import_performance_entries: 'Full'
  }},
  { id: '3', name: 'Manager', type: 'Custom', userCount: 6, permissions: {
    View_dashboard: 'View', View_users: 'View', Create_users: 'Full', Edit_users: 'Full', Delete_users: 'Full',
    View_projects: 'View', Create_projects: 'Full', Edit_projects: 'Full', Delete_projects: 'Full', View_platforms: 'View'
  }},
  { id: '5', name: 'User', type: 'Custom', userCount: 12, permissions: {
    View_dashboard: 'View', View_performance_entries: 'View', Spend_chart: 'View', Monthly_spend: 'View'
  }},
  { id: '2', name: 'Client', type: 'Custom', userCount: 3, permissions: {
    View_dashboard: 'View', View_platforms: 'View'
  }},
];

export const notifications: Notification[] = [
  { id: '1', message: '3 projects with budget overrun (>95%)', type: 'warning', time: '5 min ago', read: false },
  { id: '2', message: '5 new leads imported from Meta (Prestige)', type: 'info', time: '2 hr ago', read: false },
  { id: '3', message: 'Bing Ads token expiring in 2 days', type: 'error', time: '10 min ago', read: false },
  { id: '4', message: 'Monthly report generated for March 2026', type: 'success', time: '1 day ago', read: true },
  { id: '5', message: 'New user Meera Reddy invited', type: 'info', time: '2 days ago', read: true },
];

export const chartData = {
  performanceTrend: [
    { month: 'Apr 2025', spend: 18.5, revenue: 72.4, leads: 4800, roas: 3.9, cpa: 385 },
    { month: 'May 2025', spend: 22.3, revenue: 86.1, leads: 5600, roas: 3.86, cpa: 398 },
    { month: 'Jun 2025', spend: 26.8, revenue: 101.2, leads: 6900, roas: 3.77, cpa: 388 },
    { month: 'Jul 2025', spend: 28.4, revenue: 108.5, leads: 7200, roas: 3.82, cpa: 394 },
    { month: 'Aug 2025', spend: 30.1, revenue: 115.8, leads: 7800, roas: 3.85, cpa: 386 },
    { month: 'Sep 2025', spend: 32.5, revenue: 128.4, leads: 8400, roas: 3.95, cpa: 387 },
    { month: 'Oct 2025', spend: 34.8, revenue: 136.2, leads: 9000, roas: 3.91, cpa: 387 },
    { month: 'Nov 2025', spend: 36.2, revenue: 144.8, leads: 9200, roas: 4.0, cpa: 394 },
    { month: 'Dec 2025', spend: 38.6, revenue: 156.4, leads: 10100, roas: 4.05, cpa: 382 },
    { month: 'Jan 2026', spend: 42.1, revenue: 168.4, leads: 11200, roas: 4.0, cpa: 376 },
    { month: 'Feb 2026', spend: 44.5, revenue: 172.8, leads: 11800, roas: 3.88, cpa: 377 },
    { month: 'Mar 2026', spend: 48.2, revenue: 183.0, leads: 12840, roas: 3.8, cpa: 375 },
  ],
  quarterlySpend: [
    { quarter: 'Q1 (Apr-Jun 2025)', spend: 67.6, revenue: 259.7, users: ['Amit Mehta', 'Priya Sharma', 'Vikram Nair', 'Rahul Kumar', 'Ananya Patel', 'Karan Singh'] },
    { quarter: 'Q2 (Jul-Sep 2025)', spend: 91.0, revenue: 352.7, users: ['Amit Mehta', 'Priya Sharma', 'Vikram Nair', 'Rahul Kumar', 'Ananya Patel', 'Karan Singh'] },
    { quarter: 'Q3 (Oct-Dec 2025)', spend: 109.6, revenue: 437.4, users: ['Amit Mehta', 'Priya Sharma', 'Vikram Nair', 'Rahul Kumar', 'Ananya Patel', 'Karan Singh'] },
    { quarter: 'Q4 (Jan-Mar 2026)', spend: 134.8, revenue: 524.2, users: ['Amit Mehta', 'Priya Sharma', 'Vikram Nair', 'Rahul Kumar', 'Ananya Patel', 'Karan Singh'] },
  ],
  platformSpendShare: [
    { name: 'Google Ads', value: 50, spend: '₹22.4L' },
    { name: 'Meta Ads', value: 38, spend: '₹16.8L' },
    { name: 'Bing Ads', value: 12, spend: '₹5.9L' },
  ],
  userMonthlySpend: [
    { name: 'Amit Mehta', apr: 3.88, may: 6.82, jun: 7.17, jul: 9.27, aug: 7.94, sep: 9.09, oct: 9.05, nov: 9.94, dec: 11.76, jan: 8.63, feb: 5.83, mar: 5.21, total: 94.59 },
    { name: 'Priya Sharma', apr: 19.85, may: 19.63, jun: 16.21, jul: 17.67, aug: 13.43, sep: 14.99, oct: 20.60, nov: 20.48, dec: 20.82, jan: 23.94, feb: 14.63, mar: 5.90, total: 208.14 },
    { name: 'Vikram Nair', apr: 2.59, may: 1.72, jun: 3.18, jul: 5.35, aug: 6.22, sep: 4.04, oct: 4.55, nov: 6.87, dec: 9.42, jan: 10.74, feb: 10.83, mar: 12.91, total: 78.42 },
    { name: 'Rahul Kumar', apr: 5.01, may: 4.11, jun: 5.06, jul: 3.06, aug: 6.15, sep: 6.95, oct: 6.53, nov: 7.37, dec: 10.01, jan: 11.48, feb: 6.88, mar: 7.19, total: 79.78 },
    { name: 'Ananya Patel', apr: 6.57, may: 5.65, jun: 5.89, jul: 6.19, aug: 6.35, sep: 6.50, oct: 7.04, nov: 6.96, dec: 8.64, jan: 10.62, feb: 8.41, mar: 6.28, total: 85.10 },
    { name: 'Karan Singh', apr: 4.32, may: 5.12, jun: 4.89, jul: 5.78, aug: 7.21, sep: 6.34, oct: 7.89, nov: 8.45, dec: 9.12, jan: 10.23, feb: 7.56, mar: 6.89, total: 83.80 },
  ],
  quarterlyUserSpend: [
    { name: 'Amit Mehta', q1: 17.87, q2: 26.30, q3: 30.75, q4: 19.67, total: 94.59 },
    { name: 'Priya Sharma', q1: 55.69, q2: 46.09, q3: 61.90, q4: 44.47, total: 208.14 },
    { name: 'Vikram Nair', q1: 7.49, q2: 15.61, q3: 20.84, q4: 34.48, total: 78.42 },
    { name: 'Rahul Kumar', q1: 14.18, q2: 16.16, q3: 21.91, q4: 25.55, total: 79.78 },
    { name: 'Ananya Patel', q1: 18.11, q2: 19.04, q3: 22.64, q4: 25.31, total: 85.10 },
    { name: 'Karan Singh', q1: 14.33, q2: 19.33, q3: 25.46, q4: 24.68, total: 83.80 },
  ],
};

export const platformActiveUsers: Record<string, number> = {
  'Google Ads': 8,
  'Meta Ads': 6,
  'Bing Ads': 3,
};

// ========== PLATFORM TAB CHART DATA ==========
export const platformChartData = {
  performanceTrend: [
    { month: 'Apr 2025', google: 8.5, meta: 6.2, bing: 2.4 },
    { month: 'May 2025', google: 10.2, meta: 7.5, bing: 2.8 },
    { month: 'Jun 2025', google: 12.3, meta: 9.1, bing: 3.2 },
    { month: 'Jul 2025', google: 13.0, meta: 9.8, bing: 3.4 },
    { month: 'Aug 2025', google: 13.8, meta: 10.4, bing: 3.6 },
    { month: 'Sep 2025', google: 15.0, meta: 11.2, bing: 3.8 },
    { month: 'Oct 2025', google: 16.0, meta: 12.0, bing: 4.2 },
    { month: 'Nov 2025', google: 16.6, meta: 12.8, bing: 4.3 },
    { month: 'Dec 2025', google: 17.8, meta: 13.5, bing: 4.6 },
    { month: 'Jan 2026', google: 19.4, meta: 14.8, bing: 5.0 },
    { month: 'Feb 2026', google: 20.5, meta: 15.4, bing: 5.4 },
    { month: 'Mar 2026', google: 22.2, meta: 16.6, bing: 5.8 },
  ],
  quarterlySpend: [
    { quarter: 'Q1 (Apr-Jun)', google: 31.0, meta: 22.8, bing: 8.4 },
    { quarter: 'Q2 (Jul-Sep)', google: 41.8, meta: 31.4, bing: 10.8 },
    { quarter: 'Q3 (Oct-Dec)', google: 50.4, meta: 38.3, bing: 13.1 },
    { quarter: 'Q4 (Jan-Mar)', google: 62.1, meta: 46.8, bing: 16.2 },
  ],
  platformMonthlyDetails: [
    { name: 'Google Ads', apr: 8.5, may: 10.2, jun: 12.3, jul: 13.0, aug: 13.8, sep: 15.0, oct: 16.0, nov: 16.6, dec: 17.8, jan: 19.4, feb: 20.5, mar: 22.2, total: 185.3 },
    { name: 'Meta Ads', apr: 6.2, may: 7.5, jun: 9.1, jul: 9.8, aug: 10.4, sep: 11.2, oct: 12.0, nov: 12.8, dec: 13.5, jan: 14.8, feb: 15.4, mar: 16.6, total: 139.3 },
    { name: 'Bing Ads', apr: 2.4, may: 2.8, jun: 3.2, jul: 3.4, aug: 3.6, sep: 3.8, oct: 4.2, nov: 4.3, dec: 4.6, jan: 5.0, feb: 5.4, mar: 5.8, total: 48.5 },
  ],
  quarterlyPlatformSpend: [
    { name: 'Google Ads', q1: 31.0, q2: 41.8, q3: 50.4, q4: 62.1, total: 185.3 },
    { name: 'Meta Ads', q1: 22.8, q2: 31.4, q3: 38.3, q4: 46.8, total: 139.3 },
    { name: 'Bing Ads', q1: 8.4, q2: 10.8, q3: 13.1, q4: 16.2, total: 48.5 },
  ],
};

// ========== PROJECT TAB CHART DATA ==========
export const projectChartData = {
  performanceTrend: [
    { month: 'Apr 2025', spend: 238.14, revenue: 952.6, leads: 62800, roas: 4.0 },
    { month: 'May 2025', spend: 245.3, revenue: 981.2, leads: 64700, roas: 4.0 },
    { month: 'Jun 2025', spend: 252.8, revenue: 1011.2, leads: 66700, roas: 4.0 },
    { month: 'Jul 2025', spend: 260.5, revenue: 1042.0, leads: 68700, roas: 4.0 },
    { month: 'Aug 2025', spend: 268.4, revenue: 1073.6, leads: 70800, roas: 4.0 },
    { month: 'Sep 2025', spend: 276.6, revenue: 1106.4, leads: 72940, roas: 4.0 },
    { month: 'Oct 2025', spend: 285.1, revenue: 1140.4, leads: 75200, roas: 4.0 },
    { month: 'Nov 2025', spend: 293.8, revenue: 1175.2, leads: 77500, roas: 4.0 },
    { month: 'Dec 2025', spend: 302.8, revenue: 1211.2, leads: 79900, roas: 4.0 },
    { month: 'Jan 2026', spend: 312.1, revenue: 1248.4, leads: 82300, roas: 4.0 },
    { month: 'Feb 2026', spend: 321.6, revenue: 1286.4, leads: 84800, roas: 4.0 },
    { month: 'Mar 2026', spend: 331.4, revenue: 1325.6, leads: 87400, roas: 4.0 },
  ],
  quarterlySpend: [
    { quarter: 'Q1 (Apr-Jun)', spend: 736.24, revenue: 2944.96 },
    { quarter: 'Q2 (Jul-Sep)', spend: 805.5, revenue: 3222.0 },
    { quarter: 'Q3 (Oct-Dec)', spend: 881.7, revenue: 3526.8 },
    { quarter: 'Q4 (Jan-Mar)', spend: 965.1, revenue: 3860.4 },
  ],
  projectMonthlyDetails: [
    { name: 'AIIM', apr: 619166.13, may: 620000, jun: 625000, jul: 755799.15, aug: 760000, sep: 770000, oct: 1067202.08, nov: 1070000, dec: 1075000, jan: 876780.08, feb: 880000, mar: 890000, total: 3348947.50 },
    { name: 'Alfa Pumps', apr: 0, may: 0, jun: 0, jul: 8298.86, aug: 8500, sep: 9000, oct: 97870.77, nov: 98000, dec: 98500, jan: 117580.52, feb: 118000, mar: 120000, total: 223750.15 },
    { name: 'Ample Mods', apr: 132326.53, may: 133000, jun: 134000, jul: 185235.51, aug: 186000, sep: 187000, oct: 143179.16, nov: 144000, dec: 145000, jan: 342491.01, feb: 343000, mar: 345000, total: 803235.26 },
    { name: 'Avocats Services', apr: 0, may: 0, jun: 0, jul: 5766.65, aug: 6000, sep: 6200, oct: 56576.59, nov: 57000, dec: 57500, jan: 179803.13, feb: 180000, mar: 182000, total: 242166.37 },
    { name: 'Berks', apr: 2569695.05, may: 2580000, jun: 2590000, jul: 2365545.95, aug: 2370000, sep: 2380000, oct: 2627651.75, nov: 2630000, dec: 2635000, jan: 3354172.00, feb: 3360000, mar: 3370000, total: 10917066.35 },
    { name: 'Bonzer Marketers', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 16810.43, feb: 0, mar: 0, total: 16810.43 },
    { name: 'Botnia', apr: 317348.66, may: 318000, jun: 320000, jul: 339831.55, aug: 340000, sep: 342000, oct: 549319.56, nov: 550000, dec: 552000, jan: 477521.71, feb: 478000, mar: 480000, total: 1704041.48 },
    { name: 'Buy Mobile AU', apr: 699354.63, may: 700000, jun: 705000, jul: 681698.51, aug: 682000, sep: 685000, oct: 621311.54, nov: 622000, dec: 625000, jan: 623267.82, feb: 624000, mar: 628000, total: 2625632.50 },
    { name: 'Buy Mobile NZ', apr: 172872.73, may: 173000, jun: 174000, jul: 179388.23, aug: 180000, sep: 181000, oct: 157981.80, nov: 158000, dec: 159000, jan: 16862.30, feb: 17000, mar: 17500, total: 527100.06 },
    { name: 'Charging Cable', apr: 12987.60, may: 13000, jun: 13200, jul: 96073.54, aug: 96500, sep: 97000, oct: 10442.48, nov: 10500, dec: 10600, jan: 0, feb: 0, mar: 0, total: 119503.62 },
    { name: 'Cheap SSL Shop', apr: 801026.04, may: 802000, jun: 805000, jul: 890198.87, aug: 891000, sep: 893000, oct: 1306908.54, nov: 1308000, dec: 1310000, jan: 1400353.61, feb: 1402000, mar: 1405000, total: 4478567.06 },
    { name: 'Confiance', apr: 82529.77, may: 83000, jun: 83500, jul: 208260.18, aug: 209000, sep: 210000, oct: 43811.01, nov: 44000, dec: 44200, jan: 0, feb: 0, mar: 0, total: 334600.96 },
    { name: 'Covermagix', apr: 2395.31, may: 2400, jun: 2500, jul: 27735.13, aug: 28000, sep: 28200, oct: 13552.09, nov: 13600, dec: 13700, jan: 0, feb: 0, mar: 0, total: 43682.53 },
    { name: 'Cuff Essentials', apr: 0, may: 0, jun: 0, jul: 328017.44, aug: 329000, sep: 330000, oct: 1208702.88, nov: 1210000, dec: 1212000, jan: 993446.28, feb: 994000, mar: 997000, total: 2532166.60 },
    { name: 'D Artists', apr: 482233.75, may: 483000, jun: 485000, jul: 885680.33, aug: 886000, sep: 888000, oct: 935342.53, nov: 936000, dec: 938000, jan: 728432.84, feb: 729000, mar: 732000, total: 3031689.45 },
    { name: 'Direct Care', apr: 603792.33, may: 604000, jun: 606000, jul: 1174321.14, aug: 1175000, sep: 1177000, oct: 1288287.59, nov: 1290000, dec: 1292000, jan: 2434030.32, feb: 2435000, mar: 2440000, total: 5500431.38 },
    { name: 'Empere', apr: 119041.29, may: 119500, jun: 120000, jul: 102551.30, aug: 103000, sep: 103500, oct: 106116.58, nov: 106500, dec: 107000, jan: 118100.34, feb: 118500, mar: 119000, total: 445809.51 },
    { name: 'Fort Dental', apr: 0, may: 0, jun: 0, jul: 8474.07, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 8474.07 },
    { name: 'Gotablo', apr: 288863.15, may: 289000, jun: 290000, jul: 238650.82, aug: 239000, sep: 240000, oct: 252407.27, nov: 253000, dec: 254000, jan: 399117.58, feb: 400000, mar: 402000, total: 1179038.82 },
    { name: 'Grit & Flair', apr: 1021081.41, may: 1022000, jun: 1025000, jul: 672407.15, aug: 673000, sep: 675000, oct: 581757.12, nov: 582000, dec: 584000, jan: 128461.10, feb: 129000, mar: 130000, total: 2403716.78 },
    { name: "Massu's", apr: 118710.95, may: 119000, jun: 119500, jul: 186230.26, aug: 187000, sep: 188000, oct: 144564.88, nov: 145000, dec: 146000, jan: 15912.82, feb: 16000, mar: 16500, total: 449398.91 },
    { name: 'Helios Orthojoint', apr: 0, may: 0, jun: 0, jul: 27684.93, aug: 28000, sep: 28200, oct: 60281.03, nov: 60500, dec: 61000, jan: 83918.97, feb: 84000, mar: 84500, total: 171884.93 },
    { name: 'HRX', apr: 1135358.89, may: 1136000, jun: 1140000, jul: 1060474.68, aug: 1062000, sep: 1065000, oct: 1044210.89, nov: 1045000, dec: 1048000, jan: 0, feb: 0, mar: 0, total: 3240044.46 },
    { name: 'Icosano', apr: 222991.04, may: 223500, jun: 224000, jul: 228794.49, aug: 229000, sep: 230000, oct: 250255.62, nov: 251000, dec: 252000, jan: 195237.94, feb: 196000, mar: 197000, total: 897339.09 },
    { name: "Kalyan Women's Hospital", apr: 61629.37, may: 62000, jun: 62500, jul: 59760.52, aug: 60000, sep: 60500, oct: 83565.85, nov: 84000, dec: 84500, jan: 141871.18, feb: 142000, mar: 143000, total: 346826.92 },
    { name: 'Launch Car Scanner', apr: 55000.00, may: 55500, jun: 56000, jul: 42381.07, aug: 42500, sep: 43000, oct: 142045.56, nov: 142500, dec: 143000, jan: 152940.45, feb: 153000, mar: 154000, total: 392369.08 },
    { name: 'Link Publishers', apr: 0, may: 0, jun: 0, jul: 253794.66, aug: 254000, sep: 255000, oct: 347311.40, nov: 348000, dec: 349000, jan: 183267.35, feb: 184000, mar: 185000, total: 784373.41 },
    { name: 'Lotus Lifestyle', apr: 86703.26, may: 87000, jun: 87500, jul: 3611.94, aug: 3700, sep: 3800, oct: 122314.08, nov: 122500, dec: 123000, jan: 155210.48, feb: 155500, mar: 156000, total: 367839.78 },
    { name: 'Menu Ads', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 42.51, feb: 0, mar: 0, total: 42.51 },
    { name: 'Mithila Burn Center', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 50784.77, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 50784.77 },
    { name: 'Next Store', apr: 1346023.51, may: 1347000, jun: 1350000, jul: 1482271.71, aug: 1483000, sep: 1486000, oct: 1419720.21, nov: 1421000, dec: 1424000, jan: 1478335.18, feb: 1480000, mar: 1484000, total: 5726350.61 },
    { name: 'Nihar Netralaya', apr: 47441.94, may: 47500, jun: 48000, jul: 42144.28, aug: 42300, sep: 42500, oct: 61949.59, nov: 62000, dec: 62500, jan: 53951.52, feb: 54000, mar: 54500, total: 205487.33 },
    { name: 'NX Villa', apr: 70006.99, may: 70500, jun: 71000, jul: 4670.32, aug: 4800, sep: 5000, oct: 141549.20, nov: 142000, dec: 142500, jan: 129329.34, feb: 130000, mar: 131000, total: 345555.85 },
    { name: 'Olzam', apr: 1035398.44, may: 1036000, jun: 1038000, jul: 1148057.82, aug: 1149000, sep: 1151000, oct: 1202069.88, nov: 1203000, dec: 1206000, jan: 1274964.36, feb: 1276000, mar: 1280000, total: 4660490.50 },
    { name: 'Olavl', apr: 1168292.75, may: 1169000, jun: 1172000, jul: 954242.46, aug: 955000, sep: 958000, oct: 492751.25, nov: 493000, dec: 495000, jan: 0, feb: 0, mar: 0, total: 2615286.46 },
    { name: 'Panchamrut Skyz', apr: 0, may: 0, jun: 0, jul: 42457.62, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 42457.62 },
    { name: 'Parisar 80', apr: 0, may: 0, jun: 0, jul: 42457.62, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 42457.62 },
    { name: 'Parkview Prism', apr: 107521.03, may: 108000, jun: 108500, jul: 87111.95, aug: 87500, sep: 88000, oct: 68580.58, nov: 69000, dec: 69500, jan: 124339.93, feb: 125000, mar: 126000, total: 387553.49 },
    { name: 'Plants World', apr: 175155.71, may: 176000, jun: 177000, jul: 314743.00, aug: 315000, sep: 316000, oct: 497611.70, nov: 498000, dec: 500000, jan: 573224.08, feb: 574000, mar: 576000, total: 1560735.45 },
    { name: 'Proshare', apr: 214416.31, may: 215000, jun: 216000, jul: 1035394.55, aug: 1036000, sep: 1038000, oct: 1096436.20, nov: 1098000, dec: 1100000, jan: 1254237.67, feb: 1256000, mar: 1260000, total: 4200484.73 },
    { name: 'Puja IVF Clinic', apr: 1583.13, may: 1600, jun: 1700, jul: 98707.70, aug: 99000, sep: 99500, oct: 214153.25, nov: 215000, dec: 216000, jan: 271843.98, feb: 272000, mar: 274000, total: 586348.06 },
    { name: 'Riverway NX', apr: 22770.68, may: 23000, jun: 23200, jul: 7951.54, aug: 8000, sep: 8100, oct: 45710.74, nov: 46000, dec: 46200, jan: 0, feb: 0, mar: 0, total: 76432.96 },
    { name: 'Segal Lifestyle', apr: 56125.92, may: 56500, jun: 57000, jul: 33132.60, aug: 33300, sep: 33500, oct: 93370.45, nov: 93500, dec: 94000, jan: 124753.09, feb: 125000, mar: 126000, total: 307380.06 },
    { name: 'Squareroot', apr: 440096.52, may: 441000, jun: 442000, jul: 455391.05, aug: 456000, sep: 457000, oct: 387490.53, nov: 388000, dec: 389000, jan: 222576.52, feb: 223000, mar: 224000, total: 1535556.62 },
    { name: 'Srees Tours', apr: 0, may: 0, jun: 0, jul: 408.58, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 408.58 },
    { name: 'SSL2Buy', apr: 1010822.08, may: 1012000, jun: 1015000, jul: 1013719.14, aug: 1015000, sep: 1018000, oct: 957118.01, nov: 958000, dec: 960000, jan: 1508072.61, feb: 1510000, mar: 1514000, total: 4489731.84 },
    { name: 'Thermista', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 5138.36, nov: 5200, dec: 5300, jan: 183570.90, feb: 184000, mar: 185000, total: 188709.26 },
    { name: 'TitSpy', apr: 956641.01, may: 957000, jun: 960000, jul: 980616.41, aug: 981000, sep: 983000, oct: 1059423.41, nov: 1060000, dec: 1062000, jan: 1044760.07, feb: 1046000, mar: 1050000, total: 4041440.90 },
    { name: 'Tools4Trade', apr: 3792005.64, may: 3795000, jun: 3800000, jul: 2520915.15, aug: 2522000, sep: 2525000, oct: 3564866.51, nov: 3567000, dec: 3570000, jan: 2567023.57, feb: 2570000, mar: 2575000, total: 12444812.87 },
    { name: 'Trupply', apr: 2494592.88, may: 2496000, jun: 2500000, jul: 1642274.53, aug: 1643000, sep: 1646000, oct: 2576091.05, nov: 2578000, dec: 2580000, jan: 1921671.59, feb: 1923000, mar: 1928000, total: 8634630.05 },
    { name: 'V3Cube', apr: 196437.95, may: 197000, jun: 198000, jul: 193307.88, aug: 194000, sep: 195000, oct: 370706.11, nov: 371000, dec: 372000, jan: 337624.53, feb: 338000, mar: 340000, total: 1098076.47 },
    { name: 'Watermain Supply', apr: 695091.81, may: 696000, jun: 698000, jul: 644683.15, aug: 645000, sep: 647000, oct: 779736.51, nov: 780000, dec: 782000, jan: 610726.55, feb: 611000, mar: 613000, total: 2731040.02 },
    { name: 'Zee Overseas', apr: 358518.73, may: 359000, jun: 360000, jul: 430497.96, aug: 431000, sep: 432000, oct: 584279.31, nov: 585000, dec: 586000, jan: 580500.91, feb: 581000, mar: 583000, total: 1953796.91 },
    { name: 'Zynex', apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, jan: 0, feb: 0, mar: 0, total: 0 },
  ],
  quarterlyProjectSpend: [
    { name: 'AIIM', q1: 619166.13, q2: 755799.15, q3: 1067202.08, q4: 876780.08, total: 3348947.50 },
    { name: 'Alfa Pumps', q1: 0, q2: 8298.86, q3: 97870.77, q4: 117580.52, total: 223750.15 },
    { name: 'Ample Mods', q1: 132326.53, q2: 185235.51, q3: 143179.16, q4: 342491.01, total: 803235.26 },
    { name: 'Avocats Services', q1: 0, q2: 5766.65, q3: 56576.59, q4: 179803.13, total: 242166.37 },
    { name: 'Berks', q1: 2569695.05, q2: 2365545.95, q3: 2627651.75, q4: 3354172.00, total: 10917066.35 },
    { name: 'Bonzer Marketers', q1: 0, q2: 0, q3: 0, q4: 16810.43, total: 16810.43 },
    { name: 'Botnia', q1: 317348.66, q2: 339831.55, q3: 549319.56, q4: 477521.71, total: 1704041.48 },
    { name: 'Buy Mobile AU', q1: 699354.63, q2: 681698.51, q3: 621311.54, q4: 623267.82, total: 2625632.50 },
    { name: 'Buy Mobile NZ', q1: 172872.73, q2: 179388.23, q3: 157981.80, q4: 16862.30, total: 527100.06 },
    { name: 'Charging Cable', q1: 12987.60, q2: 96073.54, q3: 10442.48, q4: 0, total: 119503.62 },
    { name: 'Cheap SSL Shop', q1: 801026.04, q2: 890198.87, q3: 1306908.54, q4: 1400353.61, total: 4478567.06 },
    { name: 'Confiance', q1: 82529.77, q2: 208260.18, q3: 43811.01, q4: 0, total: 334600.96 },
    { name: 'Covermagix', q1: 2395.31, q2: 27735.13, q3: 13552.09, q4: 0, total: 43682.53 },
    { name: 'Cuff Essentials', q1: 0, q2: 328017.44, q3: 1208702.88, q4: 993446.28, total: 2532166.60 },
    { name: 'D Artists', q1: 482233.75, q2: 885680.33, q3: 935342.53, q4: 728432.84, total: 3031689.45 },
    { name: 'Direct Care', q1: 603792.33, q2: 1174321.14, q3: 1288287.59, q4: 2434030.32, total: 5500431.38 },
    { name: 'Empere', q1: 119041.29, q2: 102551.30, q3: 106116.58, q4: 118100.34, total: 445809.51 },
    { name: 'Fort Dental', q1: 0, q2: 8474.07, q3: 0, q4: 0, total: 8474.07 },
    { name: 'Gotablo', q1: 288863.15, q2: 238650.82, q3: 252407.27, q4: 399117.58, total: 1179038.82 },
    { name: 'Grit & Flair', q1: 1021081.41, q2: 672407.15, q3: 581757.12, q4: 128461.10, total: 2403716.78 },
    { name: "Massu's", q1: 118710.95, q2: 186230.26, q3: 144564.88, q4: 15912.82, total: 449398.91 },
    { name: 'Helios Orthojoint', q1: 0, q2: 27684.93, q3: 60281.03, q4: 83918.97, total: 171884.93 },
    { name: 'HRX', q1: 1135358.89, q2: 1060474.68, q3: 1044210.89, q4: 0, total: 3240044.46 },
    { name: 'Icosano', q1: 222991.04, q2: 228794.49, q3: 250255.62, q4: 195237.94, total: 897339.09 },
    { name: "Kalyan Women's Hospital", q1: 61629.37, q2: 59760.52, q3: 83565.85, q4: 141871.18, total: 346826.92 },
    { name: 'Launch Car Scanner', q1: 55000.00, q2: 42381.07, q3: 142045.56, q4: 152940.45, total: 392369.08 },
    { name: 'Link Publishers', q1: 0, q2: 253794.66, q3: 347311.40, q4: 183267.35, total: 784373.41 },
    { name: 'Lotus Lifestyle', q1: 86703.26, q2: 3611.94, q3: 122314.08, q4: 155210.48, total: 367839.78 },
    { name: 'Menu Ads', q1: 0, q2: 0, q3: 0, q4: 42.51, total: 42.51 },
    { name: 'Mithila Burn Center', q1: 0, q2: 0, q3: 50784.77, q4: 0, total: 50784.77 },
    { name: 'Next Store', q1: 1346023.51, q2: 1482271.71, q3: 1419720.21, q4: 1478335.18, total: 5726350.61 },
    { name: 'Nihar Netralaya', q1: 47441.94, q2: 42144.28, q3: 61949.59, q4: 53951.52, total: 205487.33 },
    { name: 'NX Villa', q1: 70006.99, q2: 4670.32, q3: 141549.20, q4: 129329.34, total: 345555.85 },
    { name: 'Olzam', q1: 1035398.44, q2: 1148057.82, q3: 1202069.88, q4: 1274964.36, total: 4660490.50 },
    { name: 'Olavl', q1: 1168292.75, q2: 954242.46, q3: 492751.25, q4: 0, total: 2615286.46 },
    { name: 'Panchamrut Skyz', q1: 0, q2: 42457.62, q3: 0, q4: 0, total: 42457.62 },
    { name: 'Parisar 80', q1: 0, q2: 42457.62, q3: 0, q4: 0, total: 42457.62 },
    { name: 'Parkview Prism', q1: 107521.03, q2: 87111.95, q3: 68580.58, q4: 124339.93, total: 387553.49 },
    { name: 'Plants World', q1: 175155.71, q2: 314743.00, q3: 497611.70, q4: 573224.08, total: 1560735.45 },
    { name: 'Proshare', q1: 214416.31, q2: 1035394.55, q3: 1096436.20, q4: 1254237.67, total: 4200484.73 },
    { name: 'Puja IVF Clinic', q1: 1583.13, q2: 98707.70, q3: 214153.25, q4: 271843.98, total: 586348.06 },
    { name: 'Riverway NX', q1: 22770.68, q2: 7951.54, q3: 45710.74, q4: 0, total: 76432.96 },
    { name: 'Segal Lifestyle', q1: 56125.92, q2: 33132.60, q3: 93370.45, q4: 124753.09, total: 307380.06 },
    { name: 'Squareroot', q1: 440096.52, q2: 455391.05, q3: 387490.53, q4: 222576.52, total: 1535556.62 },
    { name: 'Srees Tours', q1: 0, q2: 408.58, q3: 0, q4: 0, total: 408.58 },
    { name: 'SSL2Buy', q1: 1010822.08, q2: 1013719.14, q3: 957118.01, q4: 1508072.61, total: 4489731.84 },
    { name: 'Thermista', q1: 0, q2: 0, q3: 5138.36, q4: 183570.90, total: 188709.26 },
    { name: 'TitSpy', q1: 956641.01, q2: 980616.41, q3: 1059423.41, q4: 1044760.07, total: 4041440.90 },
    { name: 'Tools4Trade', q1: 3792005.64, q2: 2520915.15, q3: 3564866.51, q4: 2567023.57, total: 12444812.87 },
    { name: 'Trupply', q1: 2494592.88, q2: 1642274.53, q3: 2576091.05, q4: 1921671.59, total: 8634630.05 },
    { name: 'V3Cube', q1: 196437.95, q2: 193307.88, q3: 370706.11, q4: 337624.53, total: 1098076.47 },
    { name: 'Watermain Supply', q1: 695091.81, q2: 644683.15, q3: 779736.51, q4: 610726.55, total: 2731040.02 },
    { name: 'Zee Overseas', q1: 358518.73, q2: 430497.96, q3: 584279.31, q4: 580500.91, total: 1953796.91 },
    { name: 'Zynex', q1: 0, q2: 0, q3: 0, q4: 0, total: 0 },
  ],
};
