import { CallStatusEnum } from '@prisma/client';
import { Home, Video, FileText, Sparkles, Settings } from 'lucide-react';

export const sidebarData = [
  {
    id: 1,
    title: 'Home',
    icon: Home, 
    link: '/home',
  },
  {
    id: 2,
    title: 'Webinars',
    icon: Video, 
    link: '/webinars',
  },
  {
    id: 3,
    title: 'Leads',
    icon: FileText,
    link: '/lead',
  },
  {
    id: 4,
    title: 'Ai Agents',
    icon: Sparkles,
    link: '/ai-agents',
  },
  {
    id: 5,
    title: 'Settings',
    icon: Settings,
    link: '/settings',
  },
]

export const onBoardingSteps = [
  { id: 1, title: 'Create a webinar', complete: false, link: '' },
  { id: 2, title: 'Get leads', complete: false, link: '' },
  { id: 3, title: 'Conversion status', complete: false, link: '' },
]

export const potentialCustomer = [
  {
    "id": "101",
    "name": "Alice Johnson",
    "email": "alice.j@example.com",
    "clerkId": "abc456",
    "profileImage": "/user_alice.png",
    "isActive": true,
    "lastLoginAt": new Date("2025-11-28T10:30:00Z"),
    "createdAt": new Date("2025-10-01T08:00:00Z"),
    "updatedAt": new Date("2025-11-28T10:30:00Z"),
    "deletedAt": null,
    "tags": [
      "Existing Client",
      "Active"
    ],
    "callStatus": CallStatusEnum.COMPLETED
  },
  {
    "id": "102",
    "name": "Bob Smith",
    "email": "bob.s@company.net",
    "clerkId": "def789",
    "profileImage": "/user_bob.png",
    "isActive": false, 
    "lastLoginAt": new Date("2025-08-15T15:45:00Z"), 
    "createdAt": new Date("2025-07-20T12:00:00Z"),
    "updatedAt": new Date("2025-08-15T15:45:00Z"),
    "deletedAt": null,
    "tags": [
      "Stale Lead",
      "Follow Up"
    ],
    "callStatus": CallStatusEnum.CANCELED
  },
  {
    "id": "103",
    "name": "Charlie Brown",
    "email": "charlie.b@webmail.org",
    "clerkId": "ghi012",
    "profileImage": "/user_charlie.png",
    "isActive": true,
    "lastLoginAt": null, // Never logged in
    "createdAt": new Date(), // Created just now
    "updatedAt": new Date(),
    "deletedAt": null,
    "tags": [
      "New",
      "Hot Lead"
    ],
    "callStatus": CallStatusEnum.PENDING
  },
]