import { Form, Question, ResponseDetail, ResponsePreview, Stats, PublicForm } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const err = await res.json();
      if (err.detail && typeof err.detail === 'object') {
        errorMsg = JSON.stringify(err.detail);
      } else {
        errorMsg = err.detail || JSON.stringify(err);
      }
    } catch (e) {
      errorMsg = res.statusText;
    }
    throw new Error(errorMsg);
  }
  
  if (res.headers.get('content-type')?.includes('text/csv')) {
      return res.blob();
  }
  return res.json();
}

export const api = {
  forms: {
    list: () => fetchAPI('/forms') as Promise<Form[]>,
    create: (data: { title: string }) => fetchAPI('/forms', { method: 'POST', body: JSON.stringify(data) }) as Promise<Form>,
    get: (id: string) => fetchAPI(`/forms/${id}`) as Promise<Form>,
    update: (id: string, data: Partial<Form>) => fetchAPI(`/forms/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Form>,
    delete: (id: string) => fetchAPI(`/forms/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) => fetchAPI(`/forms/${id}/duplicate`, { method: 'POST' }) as Promise<Form>,
    publish: (id: string) => fetchAPI(`/forms/${id}/publish`, { method: 'POST' }) as Promise<{ url: string, status: string }>,
  },
  questions: {
    add: (formId: string, data: Partial<Question>) => fetchAPI(`/forms/${formId}/questions`, { method: 'POST', body: JSON.stringify(data) }) as Promise<Question>,
    update: (id: string, data: Partial<Question>) => fetchAPI(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<Question>,
    delete: (id: string) => fetchAPI(`/questions/${id}`, { method: 'DELETE' }),
    reorder: (formId: string, questionIds: string[]) => fetchAPI(`/forms/${formId}/questions/reorder`, { method: 'POST', body: JSON.stringify({ question_ids: questionIds }) }),
  },
  public: {
    getForm: (id: string) => fetchAPI(`/public/forms/${id}`) as Promise<PublicForm>,
    submit: (id: string, data: any, isFormData: boolean = false) => fetchAPI(`/public/forms/${id}/submit`, { method: 'POST', body: isFormData ? data : JSON.stringify(data) }),
    submitPartial: (id: string, data: any) => fetchAPI(`/public/forms/${id}/partial`, { method: 'POST', body: JSON.stringify(data) }),
  },
  responses: {
    list: (formId: string) => fetchAPI(`/forms/${formId}/responses`) as Promise<ResponsePreview[]>,
    get: (id: string) => fetchAPI(`/responses/${id}`) as Promise<ResponseDetail>,
    getStats: (formId: string) => fetchAPI(`/forms/${formId}/stats`) as Promise<Stats>,
    exportCsv: (formId: string) => fetchAPI(`/forms/${formId}/export`),
  }
};
