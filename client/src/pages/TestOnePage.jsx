// import { useEffect, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import TabsWrapper from '@/components/TabsWrapper'
import OneQuestionPage from '@/models/OneQuestionPage/OneQuestionPage'
import { test } from '@/service/constValues'

function TestOnePage() {
  //   const { id } = useParams()

  //   const [test, setTest] = useState(null)
  //   useEffect(() => {
  //     // fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
  //     fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`)
  //       .then((res) => res.json())
  //       .then((data) => setTest(data))
  //   }, [id])

  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  const tabs = test.questions.map((item, index) => ({
    label: `${index + 1}`,
    content: <OneQuestionPage data={item} />,
  }))

  //   const tabs = [
  //     {
  //       label: '1',
  //       content: <OneQuestionPage data={test} />,
  //     },
  //     {
  //       label: '2',
  //       content: <OneQuestionPage data={test} />,
  //     },
  //   ]

  return (
    <div>
      <h1 style={{ marginBottom: 32 }}> Страница одного теста</h1>
      <button type="button" onClick={goBack}>
        Назад к тестам
      </button>
      {test && <TabsWrapper tabs={tabs} />}
    </div>
  )
}

export default TestOnePage

/*
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OneQuestionPage from '../models/OneQuestionPage/OneQuestionPage'

const TestOnePage = () => {
  const { id } = useParams()
  const [test, setTest] = useState(null)
  useEffect(() => {
    // fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`)
      .then((res) => res.json())
      .then((data) => setTest(data))
  }, [id])

  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  return (
    <div>
      <h1 style={{ marginBottom: 32 }}> Страница одного теста</h1>
      <button onClick={goBack}>Назад к тестам</button>
      {test && (
        <>
          <OneQuestionPage data={test} />
        </>
      )}
    </div>
  )
}

export default TestOnePage

*/
