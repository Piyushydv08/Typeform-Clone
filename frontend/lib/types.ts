export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating'
  | 'file_upload';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order_index: number;
  options: string[];
  validation_config: Record<string, any>;
}

export interface Form {
  id: string;
  creator_id: number;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  theme_config: Record<string, any>;
  thank_you_message?: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
  response_count: number;
}

export interface AnswerDetail {
  question_title: string;
  answer_value?: string;
  type: QuestionType;
}

export interface ResponseDetail {
  id: string;
  form_id: string;
  submitted_at: string;
  is_complete: boolean;
  answers: AnswerDetail[];
}

export interface ResponsePreview {
  id: string;
  submitted_at: string;
  is_complete: boolean;
  preview: string;
}

export interface QuestionStats {
  title: string;
  type: QuestionType;
  total_answered: number;
  counts?: Record<string, number>;
  percentages?: Record<string, number>;
  average?: number;
}

export type Stats = Record<string, QuestionStats>;

// Public endpoints use stripped down schemas
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options: string[];
  validation_config: Record<string, any>;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string;
  theme_config: Record<string, any>;
  thank_you_message?: string;
  questions: PublicQuestion[];
}
