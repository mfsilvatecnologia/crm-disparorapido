// CopilotKit Integration Services
import { apiClient } from '@/shared/services/client';
import { z } from 'zod';

// ============================================
// SCHEMAS
// ============================================

const CopilotMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

const CopilotConversationDataSchema = z.object({
  id: z.string(),
  thread_id: z.string(),
  lead_id: z.string(),
  message_count: z.number(),
  total_tokens: z.number().optional(),
  total_cost_usd: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const CopilotConversationSchema = z.object({
  id: z.string(),
  thread_id: z.string(),
  lead_id: z.string().optional(),
  messages: z.array(CopilotMessageSchema),
  message_count: z.number().optional(),
  total_tokens: z.number().optional(),
  total_cost_usd: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const SendMessageResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    message: CopilotMessageSchema,
    conversation_id: z.string(),
    thread_id: z.string(),
  }),
  timestamp: z.string().optional(),
  trace: z.any().optional(),
});

const GetConversationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    conversation: CopilotConversationDataSchema,
    messages: z.array(CopilotMessageSchema),
  }),
  timestamp: z.string().optional(),
  trace: z.any().optional(),
});

const GraphQLResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  timestamp: z.string().optional(),
  trace: z.any().optional(),
});

// ============================================
// TYPES
// ============================================

export type CopilotMessage = z.infer<typeof CopilotMessageSchema>;
export type CopilotConversation = z.infer<typeof CopilotConversationSchema>;
export type CopilotConversationData = z.infer<typeof CopilotConversationDataSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
export type GetConversationResponse = z.infer<typeof GetConversationResponseSchema>;
export type GraphQLResponse = z.infer<typeof GraphQLResponseSchema>;

export interface SendCopilotMessageParams {
  lead_id: string;
  message: string;
  thread_id?: string;
}

export interface GraphQLQueryParams {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

const COPILOT_ENDPOINT = '/api/v1/copilot';

/**
 * Execute a GraphQL query/mutation on the CopilotKit agent
 * @param params - GraphQL query parameters (query, variables, operationName)
 * @returns Promise with the GraphQL response
 */
export async function executeCopilotGraphQL(params: GraphQLQueryParams): Promise<GraphQLResponse> {
  const { query, variables, operationName } = params;

  console.log('🔍 [COPILOT] Executing GraphQL:', {
    operationName,
    hasVariables: !!variables,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await apiClient.request<GraphQLResponse>(
      `${COPILOT_ENDPOINT}/graphql`,
      {
        method: 'POST',
        body: JSON.stringify({ query, variables, operationName }),
      },
      GraphQLResponseSchema
    );

    console.log('✅ [COPILOT] GraphQL executed successfully:', {
      success: response.success,
      operationName,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('❌ [COPILOT] Error executing GraphQL:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      operationName,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Send a message to the CopilotKit agent
 * @param params - Message parameters (lead_id, message, thread_id optional)
 * @returns Promise with the response containing the assistant's reply
 */
export async function sendCopilotMessage(params: SendCopilotMessageParams): Promise<SendMessageResponse> {
  const { lead_id, message, thread_id } = params;

  console.log('🔍 [COPILOT] Sending message:', {
    lead_id,
    thread_id,
    message_length: message?.length || 0,
    timestamp: new Date().toISOString(),
  });

  try {
    const body: any = { lead_id, message };
    if (thread_id) {
      body.thread_id = thread_id;
    }

    const response = await apiClient.request<SendMessageResponse>(
      `${COPILOT_ENDPOINT}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      SendMessageResponseSchema
    );

    console.log('✅ [COPILOT] Message sent successfully:', {
      success: response.success,
      conversation_id: response.data.conversation_id,
      thread_id: response.data.thread_id,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('❌ [COPILOT] Error sending message:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      lead_id,
      thread_id,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get a conversation by thread_id
 * @param thread_id - Thread ID of the conversation
 * @returns Promise with the conversation data including all messages
 */
export async function getCopilotConversation(thread_id: string): Promise<GetConversationResponse> {
  console.log('🔍 [COPILOT] Fetching conversation:', {
    thread_id,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await apiClient.request<GetConversationResponse>(
      `${COPILOT_ENDPOINT}/conversations/${thread_id}`,
      {
        method: 'GET',
      },
      GetConversationResponseSchema
    );

    console.log('✅ [COPILOT] Conversation fetched successfully:', {
      success: response.success,
      thread_id: response.data.conversation.thread_id,
      messages_count: response.data.messages?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('❌ [COPILOT] Error fetching conversation:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      thread_id,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Load agent state from backend (GraphQL query)
 * @param agentName - Name of the agent
 * @returns Promise with the agent state
 */
export async function loadAgentState(agentName: string): Promise<any> {
  const query = `
    query LoadAgentState($agentName: String!) {
      loadAgentState(agentName: $agentName)
    }
  `;

  const response = await executeCopilotGraphQL({
    query,
    variables: { agentName },
    operationName: 'LoadAgentState',
  });

  return response.data;
}

/**
 * Save agent state to backend (GraphQL mutation)
 * @param agentName - Name of the agent
 * @param state - State object to save
 * @returns Promise with the saved state
 */
export async function saveAgentState(agentName: string, state: any): Promise<any> {
  const mutation = `
    mutation SaveAgentState($agentName: String!, $state: JSON!) {
      saveAgentState(agentName: $agentName, state: $state)
    }
  `;

  const response = await executeCopilotGraphQL({
    query: mutation,
    variables: { agentName, state },
    operationName: 'SaveAgentState',
  });

  return response.data;
}

/**
 * Execute an action via GraphQL mutation
 * @param actionName - Name of the action to execute
 * @param args - Arguments for the action
 * @returns Promise with the action result
 */
export async function executeAction(actionName: string, args: any): Promise<any> {
  const mutation = `
    mutation ExecuteAction($actionName: String!, $args: JSON!) {
      executeAction(actionName: $actionName, args: $args)
    }
  `;

  const response = await executeCopilotGraphQL({
    query: mutation,
    variables: { actionName, args },
    operationName: 'ExecuteAction',
  });

  return response.data;
}
