// Appointment types for API responses and requests

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface CreateAppointmentRequest {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    date: string; // ISO date string
    time: string; // e.g., "10:00 AM"
    serviceType: string;
    notes?: string;
}

export interface UpdateAppointmentRequest {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    date?: string;
    time?: string;
    serviceType?: string;
    status?: AppointmentStatus;
    notes?: string;
}

export interface AppointmentResponse {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    date: Date;
    time: string;
    serviceType: string;
    status: AppointmentStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface AvailabilityRequest {
    date: string;
    time: string;
}

export interface AvailabilityResponse {
    success: boolean;
    available: boolean;
    message: string;
}

// Vapi webhook types
export interface VapiToolCall {
    id: string;
    function: {
        name: string;
        arguments: any;
    };
}

export interface VapiWebhookRequest {
    message: {
        toolCalls?: VapiToolCall[];
    };
}

export interface VapiToolResult {
    toolCallId: string;
    result: any;
}

export interface VapiWebhookResponse {
    results: VapiToolResult[];
}
