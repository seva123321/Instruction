import { useContext } from 'react'

import { QuizPageContext } from '../hoc/QuizPageProvider'

const useQuizPage = () => useContext(QuizPageContext)

export default useQuizPage
