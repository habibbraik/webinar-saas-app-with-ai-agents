import { Attendee, CtaTypeEnum } from "@prisma/client";
import { Webinar, User } from '@prisma/client';

export type validationErrors = Record<string, string>;

export type validationResult = {
    valid: boolean;
    errors: validationErrors;
}

export const validateBasicInfo = (data: {
     webinarName?:string;
      description?:string;
      date?:string;
      time?:string;
      timeFormat?:'AM' | 'PM';
}):validationResult=>{
    const errors: validationErrors = {};

     if (!data.webinarName?.trim()) {
    errors.webinarName = "Webinar name is required"
  }


  if (!data.date) {
    errors.date = "Date is required"
  }

    if (!data.description?.trim()) {
    errors.description = "Description is required"
  }



  if (!data.time?.trim()) {
    errors.time = "Time is required"
  } else {
    // Validate time format (HH:MM)
    const timeRegex = /^([0]?[1-9]|[1][0-2]):[0-5][0-9]$/
    if (!timeRegex.test(data.time)) {
      errors.time = "Time must be in format HH:MM (e.g., 10:30)"
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCTA=(data:{
  ctaLabel?: string
  tags?: string[] 
  ctaType: string
  aiAgent?: string
}):validationResult=>{
    const errors: validationErrors = {};

    if (!data.ctaLabel?.trim()) {
    errors.ctaLabel = "CTA Label is required"
  }

  if (!data.ctaType) {
    errors.aiAgent = "AI Agent is required for this CTA type"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateAdditionalInfo=(data:{
  lockChat?: boolean
  couponCode?: string
  couponEnabled?: boolean
}):validationResult=>{
    const errors: validationErrors = {};

    if(!data.couponEnabled && data.couponCode?.trim()){
      errors.couponCode = "Coupon code should not be provided if coupon is not enabled"
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
}

export type AttendanceData = {
  count: number;
  users:Attendee[];
}

export type WebinarWithPresenter = Webinar & {
  presenter: User;
};