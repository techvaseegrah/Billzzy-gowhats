import { prisma } from "./prisma";

// Enhanced Prisma model interface
interface GowhatsConfig {
  id: number;
  organisationId: number;
  whatsappNumber: string;
  accessToken: string;
  businessId: string;
  phoneNumberId: string;
  organisation?: {
    id: number;
    shopName: string;
  };
}

// Get WhatsApp configuration by organisation ID
export async function getWhatsAppConfig(organisationId: number): Promise<GowhatsConfig | null> {
  console.log(`🔍 [Org ${organisationId}] Fetching WhatsApp configuration...`);
  
  try {
    const config = await prisma.gowhats.findUnique({
      where: { organisationId },
      include: {
        organisation: {
          select: {
            id: true,
            shopName: true,
          }
        }
      }
    });

    if (!config) {
      console.warn(`⚠️  [Org ${organisationId}] No WhatsApp configuration found`);
      return null;
    }

    console.log(`✅ [Org ${organisationId}] WhatsApp config found for: ${config.organisation?.shopName}`);
    return config;
  } catch (error) {
    console.error(`❌ [Org ${organisationId}] Error fetching WhatsApp config:`, error);
    throw new Error(`Failed to fetch WhatsApp configuration for organisation ${organisationId}`);
  }
}

// Validate WhatsApp configuration with comprehensive checks
export const validateWhatsAppConfig = async (
  organisationId: number, 
  skipValidation = false
): Promise<GowhatsConfig> => {
  console.log(`🏢 [Org ${organisationId}] Validating WhatsApp configuration...`);
  
  const config = await getWhatsAppConfig(organisationId);
  
  if (!config) {
    throw new Error(`❌ [Org ${organisationId}] No WhatsApp configuration found. Please add WhatsApp config for this organisation in the gowhats table.`);
  }

  // Validate required fields
  const missingFields = [];
  if (!config.accessToken) missingFields.push('accessToken');
  if (!config.phoneNumberId) missingFields.push('phoneNumberId');
  if (!config.whatsappNumber) missingFields.push('whatsappNumber');
  if (!config.businessId) missingFields.push('businessId');

  if (missingFields.length > 0) {
    throw new Error(`❌ [Org ${organisationId}] Missing WhatsApp configuration fields: ${missingFields.join(', ')}`);
  }

  // Enhanced Phone Number ID validation with bypass option
  if (!skipValidation && !/^\d{15,20}$/.test(config.phoneNumberId)) {
    console.warn(`⚠️  [Org ${organisationId}] Phone Number ID format validation failed`);
    console.warn(`Current: "${config.phoneNumberId}" (${config.phoneNumberId.length} chars)`);
    console.warn(`Expected: 15-20 digit string from Meta Developer Console`);
    
    // Check if it's a phone number format instead of Phone Number ID
    if (/^[\+]?[0-9]{10,15}$/.test(config.phoneNumberId)) {
      console.error(`🚨 [Org ${organisationId}] CRITICAL ERROR: Using phone number instead of Phone Number ID!`);
      console.error(`\n🔧 FIX REQUIRED:`);
      console.error(`1. Go to https://developers.facebook.com/apps`);
      console.error(`2. Select your WhatsApp Business app`);
      console.error(`3. Navigate to WhatsApp → API Setup`);
      console.error(`4. Copy the Phone Number ID (15-20 digits)`);
      console.error(`5. Update database:`);
      console.error(`   UPDATE gowhats SET phoneNumberId = 'YOUR_PHONE_NUMBER_ID' WHERE organisationId = ${organisationId};`);
    }
    
    throw new Error(`[Org ${organisationId}] Invalid Phone Number ID format. Expected 15-20 digit string from Meta, got: "${config.phoneNumberId}"`);
  }

  console.log(`✅ [Org ${organisationId}] WhatsApp configuration validated successfully`);
  return config;
};

// Multi-tenant WhatsApp template message sender
export const sendWhatsAppTemplateMessage = async ({
  phone,
  templateName,
  variables,
  accessToken,
  phoneNumberId,
  organisationId,
  skipPhoneIdValidation = false
}: {
  phone: string;
  templateName: string;
  variables: string[];
  accessToken: string;
  phoneNumberId: string;
  organisationId?: number;
  skipPhoneIdValidation?: boolean;
}): Promise<any> => {
  const orgId = organisationId || 0;
  console.log(`📱 [Org ${orgId}] Preparing WhatsApp template message...`);

  // Input validation
  if (!phoneNumberId || !accessToken || !phone || !templateName) {
    throw new Error(`[Org ${orgId}] Missing required parameters: phoneNumberId, accessToken, phone, or templateName`);
  }

  // Format and validate recipient phone number
  const formattedPhone = phone.replace(/^\+/, '').replace(/\s+/g, '');
  if (!/^\d{10,15}$/.test(formattedPhone)) {
    throw new Error(`[Org ${orgId}] Invalid recipient phone number format: ${formattedPhone}`);
  }

  // Validate Phone Number ID format (with bypass option)
  if (!skipPhoneIdValidation && !/^\d{15,20}$/.test(phoneNumberId)) {
    console.error(`❌ [Org ${orgId}] PHONE NUMBER ID VALIDATION FAILED:`);
    console.error(`Received: "${phoneNumberId}" (${phoneNumberId.length} characters)`);
    console.error(`Expected: 15-20 digit string from Meta Developer Console`);
    console.error(`\n🔧 SOLUTION FOR ORGANISATION ${orgId}:`);
    console.error(`UPDATE gowhats SET phoneNumberId = 'CORRECT_PHONE_NUMBER_ID' WHERE organisationId = ${orgId};`);
    
    throw new Error(`[Org ${orgId}] Invalid Phone Number ID format. Expected 15-20 digits, got: "${phoneNumberId}"`);
  }

  // Prepare WhatsApp API payload
  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: variables.map((text) => ({
            type: "text",
            text: text.toString(),
          })),
        },
      ],
    },
  };

  const apiUrl = `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`;

  console.log(`📤 [Org ${orgId}] WhatsApp API Request Details:`, {
    url: apiUrl,
    to: formattedPhone,
    template: templateName,
    phoneNumberId: `${phoneNumberId} (${phoneNumberId.length} chars)`,
    variableCount: variables.length,
    organisationId: orgId
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`❌ [Org ${orgId}] WhatsApp API Error Response:`, {
        status: response.status,
        statusText: response.statusText,
        phoneNumberId,
        response: responseText,
      });

      // Enhanced error handling for multi-tenant context
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(responseText);
          const errorMessage = errorData.error?.message || 'Unknown error';
          
          if (errorMessage.includes("does not exist") || errorMessage.includes("Phone number not found")) {
            throw new Error(`❌ [Org ${orgId}] PHONE NUMBER ID NOT FOUND: "${phoneNumberId}"

🔧 ORGANISATION ${orgId} SETUP REQUIRED:
1. Visit: https://developers.facebook.com/apps
2. Select your WhatsApp Business App
3. Go to: WhatsApp → API Setup
4. Copy the Phone Number ID (15-20 digits)
5. Execute: UPDATE gowhats SET phoneNumberId = 'CORRECT_ID' WHERE organisationId = ${orgId};

❌ Current: ${phoneNumberId}
✅ Expected: Similar to 103845262701234567`);
          }
          
          if (errorMessage.includes("permissions") || errorMessage.includes("access")) {
            throw new Error(`[Org ${orgId}] Access token missing permissions. Required: 'whatsapp_business_messaging', 'whatsapp_business_management'`);
          }

          if (errorMessage.includes("template") || errorMessage.includes("not found")) {
            throw new Error(`[Org ${orgId}] WhatsApp template '${templateName}' not found or not approved for this business account`);
          }
        } catch (parseError) {
          // If JSON parsing fails, use original response
        }
      }

      throw new Error(`[Org ${orgId}] WhatsApp API request failed: ${response.status} - ${responseText}`);
    }

    const responseData = JSON.parse(responseText);
    console.log(`✅ [Org ${orgId}] WhatsApp message sent successfully:`, {
      messageId: responseData.messages?.[0]?.id,
      status: responseData.messages?.[0]?.message_status
    });
    
    return responseData;
  } catch (error: any) {
    console.error(`💥 [Org ${orgId}] WhatsApp message sending failed:`, error.message);
    throw error;
  }
};

// Send WhatsApp message using organisation ID (auto-fetch config)
export const sendWhatsAppMessageByOrganisation = async ({
  organisationId,
  phone,
  templateName,
  variables,
  skipValidation = false
}: {
  organisationId: number;
  phone: string;
  templateName: string;
  variables: string[];
  skipValidation?: boolean;
}): Promise<any> => {
  console.log(`🚀 [Org ${organisationId}] Initiating WhatsApp message send...`);
  
  try {
    const config = await validateWhatsAppConfig(organisationId, skipValidation);
    
    return await sendWhatsAppTemplateMessage({
      phone,
      templateName,
      variables,
      accessToken: config.accessToken,
      phoneNumberId: config.phoneNumberId,
      organisationId,
      skipPhoneIdValidation: skipValidation
    });
  } catch (error: any) {
    console.error(`❌ [Org ${organisationId}] Failed to send WhatsApp message:`, error.message);
    throw new Error(`[Org ${organisationId}] WhatsApp send failed: ${error.message}`);
  }
};

// Multi-tenant batch message sender with detailed results
export const sendBulkWhatsAppMessages = async (
  messages: Array<{
    organisationId: number;
    phone: string;
    templateName: string;
    variables: string[];
  }>
): Promise<Array<{
  success: boolean;
  organisationId: number;
  phone: string;
  result?: any;
  error?: string;
}>> => {
  console.log(`📦 Starting bulk WhatsApp message send for ${messages.length} messages`);
  
  const results = [];
  
  for (const [index, message] of messages.entries()) {
    console.log(`📨 Processing message ${index + 1}/${messages.length} for Org ${message.organisationId}`);
    
    try {
      const result = await sendWhatsAppMessageByOrganisation(message);
      results.push({ 
        success: true, 
        organisationId: message.organisationId, 
        phone: message.phone,
        result
      });
      console.log(`✅ Message ${index + 1} sent successfully to Org ${message.organisationId}`);
    } catch (error: any) {
      results.push({ 
        success: false, 
        organisationId: message.organisationId, 
        phone: message.phone,
        error: error.message
      });
      console.error(`❌ Message ${index + 1} failed for Org ${message.organisationId}:`, error.message);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Bulk send completed: ${successCount}/${messages.length} successful`);
  
  return results;
};

// CRUD Operations for WhatsApp Configuration Management

// Create or update WhatsApp configuration for an organisation
export const upsertWhatsAppConfig = async ({
  organisationId,
  whatsappNumber,
  accessToken,
  businessId,
  phoneNumberId
}: {
  organisationId: number;
  whatsappNumber: string;
  accessToken: string;
  businessId: string;
  phoneNumberId: string;
}): Promise<GowhatsConfig> => {
  console.log(`💾 [Org ${organisationId}] Upserting WhatsApp configuration...`);
  
  try {
    // Validate Phone Number ID format before saving
    if (!/^\d{15,20}$/.test(phoneNumberId)) {
      throw new Error(`Invalid Phone Number ID format: "${phoneNumberId}". Expected 15-20 digit string from Meta.`);
    }

    const config = await prisma.gowhats.upsert({
      where: { organisationId },
      update: {
        whatsappNumber,
        accessToken,
        businessId,
        phoneNumberId
      },
      create: {
        organisationId,
        whatsappNumber,
        accessToken,
        businessId,
        phoneNumberId
      },
      include: {
        organisation: {
          select: {
            id: true,
            shopName: true,
          }
        }
      }
    });

    console.log(`✅ [Org ${organisationId}] WhatsApp configuration saved successfully`);
    return config;
  } catch (error: any) {
    console.error(`❌ [Org ${organisationId}] Failed to save WhatsApp config:`, error.message);
    throw new Error(`Failed to save WhatsApp configuration for organisation ${organisationId}: ${error.message}`);
  }
};

// Get all WhatsApp configurations (for admin purposes)
export const getAllWhatsAppConfigs = async (): Promise<GowhatsConfig[]> => {
  console.log(`📋 Fetching all WhatsApp configurations...`);
  
  try {
    const configs = await prisma.gowhats.findMany({
      include: {
        organisation: {
          select: {
            id: true,
            shopName: true,
          }
        }
      },
      orderBy: {
        organisationId: 'asc'
      }
    });

    console.log(`✅ Found ${configs.length} WhatsApp configurations`);
    return configs;
  } catch (error: any) {
    console.error(`❌ Failed to fetch WhatsApp configurations:`, error.message);
    throw new Error(`Failed to fetch WhatsApp configurations: ${error.message}`);
  }
};

// Delete WhatsApp configuration for an organisation
export const deleteWhatsAppConfig = async (organisationId: number): Promise<boolean> => {
  console.log(`🗑️  [Org ${organisationId}] Deleting WhatsApp configuration...`);
  
  try {
    await prisma.gowhats.delete({
      where: { organisationId }
    });

    console.log(`✅ [Org ${organisationId}] WhatsApp configuration deleted successfully`);
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.warn(`⚠️  [Org ${organisationId}] WhatsApp configuration not found (already deleted)`);
      return false;
    }
    
    console.error(`❌ [Org ${organisationId}] Failed to delete WhatsApp config:`, error.message);
    throw new Error(`Failed to delete WhatsApp configuration for organisation ${organisationId}: ${error.message}`);
  }
};

// Check if WhatsApp is properly configured for an organisation
export const isWhatsAppConfigured = async (organisationId: number): Promise<boolean> => {
  console.log(`🔍 [Org ${organisationId}] Checking WhatsApp configuration status...`);
  
  try {
    const config = await getWhatsAppConfig(organisationId);
    const isConfigured = !!(config?.accessToken && config?.phoneNumberId && config?.whatsappNumber && config?.businessId);
    
    console.log(`${isConfigured ? '✅' : '❌'} [Org ${organisationId}] WhatsApp configured: ${isConfigured}`);
    return isConfigured;
  } catch (error: any) {
    console.error(`❌ [Org ${organisationId}] Error checking WhatsApp config:`, error.message);
    return false;
  }
};

// Test WhatsApp configuration by sending a test message
export const testWhatsAppConfig = async (
  organisationId: number, 
  testPhone: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  console.log(`🧪 [Org ${organisationId}] Testing WhatsApp configuration...`);
  
  try {
    const config = await validateWhatsAppConfig(organisationId, false);
    
    // Send a simple test template (you may need to create this template in your WhatsApp Business Account)
    const result = await sendWhatsAppTemplateMessage({
      phone: testPhone,
      templateName: 'hello_world', // Default Meta test template
      variables: [],
      accessToken: config.accessToken,
      phoneNumberId: config.phoneNumberId,
      organisationId
    });

    return {
      success: true,
      message: `WhatsApp configuration test successful for organisation ${organisationId}`,
      data: result
    };
  } catch (error: any) {
    console.error(`❌ [Org ${organisationId}] WhatsApp test failed:`, error.message);
    return {
      success: false,
      message: `WhatsApp test failed: ${error.message}`
    };
  }
};