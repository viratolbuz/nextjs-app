import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_drvmd74"; 
const EMAILJS_TEMPLATE_ID = "template_235x248"; 
const EMAILJS_PUBLIC_KEY = "pVCm63YCt7pfmcvNe"; 

const isConfigured = () => EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

export interface SendInviteResult {
  success: boolean;
  message: string;
  method: "email" | "link-only";
}

export const sendInviteEmail = async (toEmail: string, signupLink: string): Promise<SendInviteResult> => {
  if (!isConfigured()) {
    console.warn("[EmailService] EmailJS not configured — falling back to link-only mode.");
    return {
      success: true,
      message: "EmailJS not configured. Share the signup link manually.",
      method: "link-only",
    };
  }

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        signup_link: signupLink,
        from_name: "AdtoRise PMS",
        message:
          "Please complete your registration by clicking the link above. After signing up, your account will be reviewed by an admin.",
      },
      EMAILJS_PUBLIC_KEY,
    );

    return {
      success: true,
      message: `Invitation email sent to ${toEmail}`,
      method: "email",
    };
  } catch (error: any) {
    console.error("[EmailService] Failed to send email:", error);
    return {
      success: false,
      message: error?.text || "Failed to send email. You can share the link manually.",
      method: "link-only",
    };
  }
};

export const isEmailConfigured = () => isConfigured();
