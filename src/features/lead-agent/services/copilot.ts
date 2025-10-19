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

// Schema GraphQL do Backend - baseado em copilotRuntime.schema.ts
const AgentStateSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  agentId: z.string(),
  state: z.any(), // JSON scalar
  metadata: z.any().optional(), // JSON scalar
  createdAt: z.string(), // DateTime scalar (ISO 8601)
  updatedAt: z.string(), // DateTime scalar (ISO 8601)
});

const ActionResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(), // JSON scalar
  error: z.string().optional(),
  executionTime: z.number().optional(),
});

const GraphQLResponseSchema = z.object({
  data: z.any().optional(),
  errors: z.array(z.object({
    message: z.string(),
    locations: z.array(z.any()).optional(),
    path: z.array(z.any()).optional(),
    extensions: z.any().optional(),
  })).optional(),
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
export type AgentState = z.infer<typeof AgentStateSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;

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

const COPILOT_ENDPOINT = '/copilot';
const GRAPHQL_ENDPOINT = '/copilot/graphql';

/**
 * Execute a GraphQL query/mutation on the CopilotKit agent
 *
 * Backend GraphQL Schema (Apollo Server):
 * - Query: loadAgentState(agentId: String!): AgentState
 * - Mutation: saveAgentState(agentId: String!, state: JSON!, metadata: JSON): AgentState!
 * - Mutation: executeAction(actionName: String!, params: JSON): ActionResult!
 *
 * @param params - GraphQL query parameters (query, variables, operationName)
 * @returns Promise with the GraphQL response
 */
export async function executeCopilotGraphQL(params: GraphQLQueryParams): Promise<GraphQLResponse> {
  console.log('🔍 [COPILOT GraphQL] Executing query:', {
    operationName: params.operationName,
    hasVariables: !!params.variables,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await apiClient.request<GraphQLResponse>(
      GRAPHQL_ENDPOINT,
      {
        method: 'POST',
        body: JSON.stringify({
          query: params.query,
          variables: params.variables,
          operationName: params.operationName,
        }),
      },
      GraphQLResponseSchema
    );

    if (response.errors && response.errors.length > 0) {
      console.error('❌ [COPILOT GraphQL] Query returned errors:', {
        errors: response.errors,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join(', ')}`);
    }

    console.log('✅ [COPILOT GraphQL] Query executed successfully:', {
      operationName: params.operationName,
      hasData: !!response.data,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error('❌ [COPILOT GraphQL] Error executing query:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      operationName: params.operationName,
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
 *
 * Backend Schema:
 * query {
 *   loadAgentState(agentId: String!): AgentState
 * }
 *
 * @param agentId - Unique identifier for the agent
 * @returns Promise with the agent state or null if not found
 */
export async function loadAgentState(agentId: string): Promise<AgentState | null> {
  console.log('🔍 [COPILOT] Loading agent state:', { agentId });

  const query = `
    query LoadAgentState($agentId: String!) {
      loadAgentState(agentId: $agentId) {
        id
        empresaId
        agentId
        state
        metadata
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const response = await executeCopilotGraphQL({
      query,
      variables: { agentId },
      operationName: 'LoadAgentState',
    });

    const agentState = response.data?.loadAgentState;
    
    if (!agentState) {
      console.log('ℹ️ [COPILOT] No agent state found for:', { agentId });
      return null;
    }

    const validated = AgentStateSchema.parse(agentState);
    console.log('✅ [COPILOT] Agent state loaded successfully:', {
      agentId: validated.agentId,
      hasState: !!validated.state,
      hasMetadata: !!validated.metadata,
    });

    return validated;
  } catch (error) {
    console.error('❌ [COPILOT] Error loading agent state:', {
      error: error instanceof Error ? error.message : error,
      agentId,
    });
    throw error;
  }
}

/**
 * Save agent state to backend (GraphQL mutation)
 *
 * Backend Schema:
 * mutation {
 *   saveAgentState(agentId: String!, state: JSON!, metadata: JSON): AgentState!
 * }
 *
 * Uses UPSERT logic based on (empresa_id, agent_id)
 *
 * @param agentId - Unique identifier for the agent
 * @param state - State object to save (any JSON-serializable data)
 * @param metadata - Optional metadata (any JSON-serializable data)
 * @returns Promise with the saved agent state
 */
export async function saveAgentState(
  agentId: string,
  state: any,
  metadata?: any
): Promise<AgentState> {
  console.log('🔍 [COPILOT] Saving agent state:', {
    agentId,
    hasState: !!state,
    hasMetadata: !!metadata,
  });

  const mutation = `
    mutation SaveAgentState($agentId: String!, $state: JSON!, $metadata: JSON) {
      saveAgentState(agentId: $agentId, state: $state, metadata: $metadata) {
        id
        empresaId
        agentId
        state
        metadata
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const response = await executeCopilotGraphQL({
      query: mutation,
      variables: { agentId, state, metadata },
      operationName: 'SaveAgentState',
    });

    const savedState = response.data?.saveAgentState;
    
    if (!savedState) {
      throw new Error('No data returned from saveAgentState mutation');
    }

    const validated = AgentStateSchema.parse(savedState);
    console.log('✅ [COPILOT] Agent state saved successfully:', {
      agentId: validated.agentId,
      stateId: validated.id,
    });

    return validated;
  } catch (error) {
    console.error('❌ [COPILOT] Error saving agent state:', {
      error: error instanceof Error ? error.message : error,
      agentId,
    });
    throw error;
  }
}

/**
 * Execute an action via GraphQL mutation
 *
 * Backend Schema:
 * mutation {
 *   executeAction(actionName: String!, params: JSON): ActionResult!
 * }
 *
 * @param actionName - Name of the action to execute
 * @param params - Optional parameters for the action (any JSON-serializable data)
 * @returns Promise with the action result
 */
export async function executeAction(
  actionName: string,
  params?: any
): Promise<ActionResult> {
  console.log('🔍 [COPILOT] Executing action:', {
    actionName,
    hasParams: !!params,
  });

  const mutation = `
    mutation ExecuteAction($actionName: String!, $params: JSON) {
      executeAction(actionName: $actionName, params: $params) {
        success
        data
        error
        executionTime
      }
    }
  `;

  try {
    const response = await executeCopilotGraphQL({
      query: mutation,
      variables: { actionName, params },
      operationName: 'ExecuteAction',
    });

    const result = response.data?.executeAction;
    
    if (!result) {
      throw new Error('No data returned from executeAction mutation');
    }

    const validated = ActionResultSchema.parse(result);
    console.log('✅ [COPILOT] Action executed:', {
      actionName,
      success: validated.success,
      executionTime: validated.executionTime,
      hasError: !!validated.error,
    });

    return validated;
  } catch (error) {
    console.error('❌ [COPILOT] Error executing action:', {
      error: error instanceof Error ? error.message : error,
      actionName,
    });
    throw error;
  }
}
