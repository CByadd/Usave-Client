'use client';

import { config, getApiUrl } from '../lib/config';

const API_BASE_URL = config.api.baseURL;

export async function requestApproval(ownerEmail, orderDetails, userId) {
  try {
    const response = await fetch(getApiUrl(config.endpoints.orders.requestApproval), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ownerEmail,
        orderDetails,
        userId
      }),
      credentials: 'include' // Important for cookies if using sessions
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      let errorMessage = 'Failed to request approval';
      try {
        const jsonError = JSON.parse(errorData);
        errorMessage = jsonError.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, orderId: data.orderId };
  } catch (error) {
    console.error('Approval request error:', error);
    return { error: error.message };
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(getApiUrl(config.endpoints.orders.requestApproval), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        status: 'pending_payment'
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      let errorMessage = 'Failed to create order';
      try {
        const jsonError = JSON.parse(errorData);
        errorMessage = jsonError.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, orderId: data.orderId };
  } catch (error) {
    console.error('Create order error:', error);
    return { error: error.message };
  }
}

export async function approveOrder(token) {
  try {
    const response = await fetch(getApiUrl('/orders/approve'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', errorData);
      let errorMessage = 'Failed to approve order';
      try {
        const jsonError = JSON.parse(errorData);
        errorMessage = jsonError.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, orderId: data.orderId };
  } catch (error) {
    console.error('Order approval error:', error);
    return { error: error.message };
  }
}
