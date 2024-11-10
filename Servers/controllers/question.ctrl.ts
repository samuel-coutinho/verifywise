import { Request, Response } from "express";
import { Question } from "../models/question.model";
const MOCK_DATA_ON = process.env.MOCK_DATA_ON;

import { STATUS_CODE } from "../utils/statusCode.utils";
import {
  createMockQuestion,
  deleteMockQuestionById,
  getAllMockQuestions,
  getMockQuestionById,
  updateMockQuestionById,
} from "../mocks/tools/question.mock.db";
import {
  createNewQuestionQuery,
  deleteQuestionByIdQuery,
  getAllQuestionsQuery,
  getQuestionByIdQuery,
  updateQuestionByIdQuery,
} from "../utils/question.utils";

export async function getAllQuestions(
  req: Request,
  res: Response
): Promise<any> {
  try {
    if (MOCK_DATA_ON === "true") {
      const questions = getAllMockQuestions();

      if (questions) {
        return res.status(200).json(STATUS_CODE[200](questions));
      }

      return res.status(204).json(STATUS_CODE[204](questions));
    } else {
      const questions = await getAllQuestionsQuery();

      if (questions) {
        return res.status(200).json(STATUS_CODE[200](questions));
      }

      return res.status(204).json(STATUS_CODE[204](questions));
    }
  } catch (error) {
    return res.status(500).json(STATUS_CODE[500]((error as Error).message));
  }
}

export async function getQuestionById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const questionId = parseInt(req.params.id);

    if (MOCK_DATA_ON === "true") {
      const question = getMockQuestionById(questionId);

      if (question) {
        return res.status(200).json(STATUS_CODE[200](question));
      }

      return res.status(404).json(STATUS_CODE[404](question));
    } else {
      const question = await getQuestionByIdQuery(questionId);

      if (question) {
        return res.status(200).json(STATUS_CODE[200](question));
      }

      return res.status(404).json(STATUS_CODE[404](question));
    }
  } catch (error) {
    return res.status(500).json(STATUS_CODE[500]((error as Error).message));
  }
}

export async function createQuestion(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const newQuestion: Question = req.body;

    if (
      !newQuestion.subtopicId ||
      !newQuestion.questionText ||
      !newQuestion.answerType ||
      newQuestion.isRequired === undefined
    ) {
      return res.status(400).json(
        STATUS_CODE[400]({
          message:
            "subtopicId, questionText, answerType and isRequired are required",
        })
      );
    }

    if (MOCK_DATA_ON === "true") {
      const createdQuestion = createMockQuestion(newQuestion);

      if (createdQuestion) {
        return res.status(201).json(STATUS_CODE[201](createdQuestion));
      }

      return res.status(503).json(STATUS_CODE[503]({}));
    } else {
      const createdQuestion = await createNewQuestionQuery(newQuestion);

      if (createdQuestion) {
        return res.status(201).json(STATUS_CODE[201](createdQuestion));
      }

      return res.status(503).json(STATUS_CODE[503]({}));
    }
  } catch (error) {
    return res.status(500).json(STATUS_CODE[500]((error as Error).message));
  }
}

export async function updateQuestionById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const questionId = parseInt(req.params.id);
    const updatedQuestion: Question = req.body;

    if (
      !updatedQuestion.subtopicId ||
      !updatedQuestion.questionText ||
      !updatedQuestion.answerType ||
      updatedQuestion.isRequired === undefined
    ) {
      return res.status(400).json(
        STATUS_CODE[400]({
          message:
            "subtopicId, questionText, answerType and isRequired are required",
        })
      );
    }

    if (MOCK_DATA_ON === "true") {
      const question = updateMockQuestionById(questionId, updatedQuestion);

      if (question) {
        return res.status(202).json(STATUS_CODE[202](question));
      }

      return res.status(404).json(STATUS_CODE[404]({}));
    } else {
      const question = await updateQuestionByIdQuery(
        questionId,
        updatedQuestion
      );

      if (question) {
        return res.status(202).json(STATUS_CODE[202](question));
      }

      return res.status(404).json(STATUS_CODE[404]({}));
    }
  } catch (error) {
    return res.status(500).json(STATUS_CODE[500]((error as Error).message));
  }
}

export async function deleteQuestionById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const questionId = parseInt(req.params.id);

    if (MOCK_DATA_ON === "true") {
      const deletedQuestion = deleteMockQuestionById(questionId);

      if (deletedQuestion) {
        return res.status(202).json(STATUS_CODE[202](deletedQuestion));
      }

      return res.status(404).json(STATUS_CODE[404]({}));
    } else {
      const deletedQuestion = await deleteQuestionByIdQuery(questionId);

      if (deletedQuestion) {
        return res.status(202).json(STATUS_CODE[202](deletedQuestion));
      }

      return res.status(404).json(STATUS_CODE[404]({}));
    }
  } catch (error) {
    return res.status(500).json(STATUS_CODE[500]((error as Error).message));
  }
}
