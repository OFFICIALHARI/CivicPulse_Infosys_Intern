
export const GRIEVANCE_CATEGORIES = [
  "Waste Management",
  "Water Supply",
  "Street Lighting",
  "Road Maintenance",
  "Public Health",
  "Traffic & Transport",
  "Parks & Recreation",
  "Electricity",
  "Other"
];

export const MOCK_USERS = [
  { id: '1', name: 'Citizen User', email: 'citizen@civicpulse.com', role: 'CITIZEN' },
  { id: '2', name: 'Super Admin', email: 'admin@civicpulse.com', role: 'ADMIN' },
  { id: '3', name: 'John Doe (Roads)', email: 'roads@civicpulse.com', role: 'OFFICER', department: 'Road Maintenance' },
  { id: '4', name: 'Jane Smith (Waste)', email: 'waste@civicpulse.com', role: 'OFFICER', department: 'Waste Management' },
];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  REOPENED: 'bg-red-100 text-red-800 border-red-200',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};
