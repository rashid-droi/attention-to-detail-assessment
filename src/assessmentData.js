/** Shared assessment copy for the form, API payload snapshot, results page, and PDF. */

/** Session snapshot after successful submit (read by the result route). */
export const RESULT_STORAGE_KEY = 'attention_assessment_latest_result'

export const questions = [
  'When reading, I notice even minor errors in spelling or grammar.',
  'I double-check names, numbers, and other important details before finalising a document or sending an email.',
  'When given multi-step instructions, I can accurately recall and follow each step without frequently referring back.',
  'I carefully organise my workspace, ensuring everything has a specific place.',
  'When someone provides oral information, I often need to clarify or ask them to repeat details.',
  'I find discrepancies in data or patterns that others often overlook.',
  'I tend to complete tasks well before deadlines, giving myself ample time to review my work.',
  'I feel the need to make to-do lists and check off tasks as I complete them.',
  'In team meetings or discussions, I frequently catch and remember points that others may forget.',
  'I prefer to work on one task at a time rather than juggling multiple tasks simultaneously.',
  'When learning a new task, I prefer step-by-step guidance and thorough explanations.',
  'I often spot inconsistencies in stories, articles, or reports that others might miss.',
  'Before making decisions, I gather all the necessary information and consider every detail.',
  "I feel uncomfortable if I don't get the chance to review my work multiple times.",
  'People often rely on me to catch mistakes or oversee quality checks because of my meticulous nature.'
]

export const interpretationNote =
  "Remember, this quiz provides a general indication and might not capture all nuances of an individual's attention to detail. Regular feedback, reflection, and training can help improve this skill over time."

export function interpretationForScore(score) {
  if (score >= 65) {
    return 'Exceptional attention to detail. You have a keen eye for specifics and rarely overlook even the minutest details.'
  }
  if (score >= 50) {
    return 'Above-average attention to detail. You are generally meticulous, but there may be occasional lapses.'
  }
  if (score >= 35) {
    return "Average attention to detail. While you catch many details, there's room for improvement in certain scenarios."
  }
  return 'Below-average attention to detail. You might miss out on certain details; consider strategies to enhance your focus and thoroughness.'
}

export const scoreInterpretationRows = [
  {
    range: '65-75',
    title: 'Exceptional attention to detail.',
    description: 'You have a keen eye for specifics and rarely overlook even the minutest details.'
  },
  {
    range: '50-64',
    title: 'Above-average attention to detail.',
    description: 'You are generally meticulous, but there may be occasional lapses.'
  },
  {
    range: '35-49',
    title: 'Average attention to detail.',
    description: "While you catch many details, there's room for improvement in certain scenarios."
  },
  {
    range: '15-34',
    title: 'Below-average attention to detail.',
    description: 'You might miss out on certain details; consider strategies to enhance your focus and thoroughness.'
  }
]
