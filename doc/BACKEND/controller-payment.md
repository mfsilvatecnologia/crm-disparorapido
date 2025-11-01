
  /**
   * @swagger
   * /payments/history:
   *   get:
   *     summary: "List Payment History"
   *     description: "Retrieves a paginated list of payments for the authenticated user/empresa."
   *     tags:
   *       - "Payments"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: "Number of items to return."
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: "Offset for pagination."
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, CANCELLED]
   *         description: "Filter by payment status."
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: "Filter by start date (ISO 8601)."
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: "Filter by end date (ISO 8601)."
   *     responses:
   *       '200':
   *         description: "A list of payments."
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaymentListResponse'
   *       '401':
   *         description: "Unauthorized."
   */
  
  /**
   * @swagger
   * /payments/{paymentId}:
   *   get:
   *     summary: "Get Payment Details"
   *     description: "Retrieves the full details of a specific payment."
   *     tags:
   *       - "Payments"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: string
   *         description: "The ID of the payment to retrieve."
   *     responses:
   *       '200':
   *         description: "The full details of the payment."
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Payment'
   *       '401':
   *         description: "Unauthorized."
   *       '404':
   *         description: "Payment not found."
   */
  

  /**
   * @swagger
   * /payments/credits/transactions:
   *   get:
   *     summary: "List Credit Transactions"
   *     description: "Retrieves a paginated list of credit transactions for the authenticated user/empresa."
   *     tags:
   *       - "Credits"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: "Number of items to return."
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: "Offset for pagination."
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [compra, uso, reembolso, bonus]
   *         description: "Filter by transaction type."
   *     responses:
   *       '200':
   *         description: "A list of credit transactions."
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CreditTransaction'
   *       '401':
   *         description: "Unauthorized."
   */
  

  /**
   * @swagger
   * /payments/summary:
   *   get:
   *     summary: "Get Financial Summary"
   *     description: "Retrieves an aggregated financial summary for the authenticated user/empresa."
   *     tags:
   *       - "Payments"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [last30days, last90days, currentMonth, allTime]
   *           default: last90days
   *         description: "The time period for the summary."
   *     responses:
   *       '200':
   *         description: "The financial summary."
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FinancialSummary'
   *       '401':
   *         description: "Unauthorized."
   */
  

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         empresaId:
 *           type: string
 *           nullable: true
 *         value:
 *           type: number
 *         netValue:
 *           type: number
 *         description:
 *           type: string
 *         billingType:
 *           type: string
 *           enum: [BOLETO, CREDIT_CARD, PIX, UNDEFINED]
 *         status:
 *           type: string
 *           enum: [PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, CANCELLED]
 *         dueDate:
 *           type: string
 *           format: date
 *         paymentDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         invoiceUrl:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     PaymentListResponse:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         limit:
 *           type: integer
 *         offset:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *
 *     SummaryItem:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *         amount:
 *           type: number
 *
 *     FinancialSummary:
 *       type: object
 *       properties:
 *         totalAmountSpent:
 *           type: number
 *         payments:
 *           type: object
 *           properties:
 *             totalCount:
 *               type: integer
 *             pending:
 *               $ref: '#/components/schemas/SummaryItem'
 *             received:
 *               $ref: '#/components/schemas/SummaryItem'
 *             overdue:
 *               $ref: '#/components/schemas/SummaryItem'
 *         credits:
 *           type: object
 *           properties:
 *             currentBalance:
 *               type: number
 *             totalPurchased:
 *               type: number
 *             totalUsed:
 *               type: number
 *             amountSpentOnCredits:
 *               type: number
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *
 *     CreditTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         empresaId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [compra, uso, reembolso, bonus]
 *         quantity:
 *           type: number
 *         previousBalance:
 *           type: number
 *         newBalance:
 *           type: number
 *         amountPaid:
 *           type: number
 *           nullable: true
 *         paymentId:
 *           type: string
 *           nullable: true
 *         lead:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
