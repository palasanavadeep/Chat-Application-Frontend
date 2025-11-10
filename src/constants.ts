// src/constants.ts
// Project-wide constants and types

export const ROLES = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;


export const CONVERSATION_TYPES = {
    PERSONAL : 'PERSONAL',
    GROUP : 'GROUP',
    BROADCAST : 'BROADCAST'
}


export const ATTACHMENT_TYPES = {
    IMAGE : 'IMAGE',
    PDF : 'PDF',
    VIDEO : 'VIDEO',
    AUDIO : 'AUDIO',
    OTHER : 'OTHER'
}



export const MESSAGE_STATUS = {
    SENT : 'SENT',
    DELIVERED : 'DELIVERED',
    READ : 'READ',
    DELETED : 'DELETED'
}


export type Role = (typeof ROLES)[keyof typeof ROLES];
export type CONVERSATION_TYPES = (typeof CONVERSATION_TYPES)[keyof typeof CONVERSATION_TYPES];
export type ATTACHMENT_TYPES = (typeof ATTACHMENT_TYPES)[keyof typeof ATTACHMENT_TYPES];
export type MESSAGE_STATUS = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];