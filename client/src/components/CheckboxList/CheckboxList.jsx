import React from 'react'

import CheckboxForm from '@/components/CheckboxForm'

function CheckboxList({ data, register, control }) {
  return (
    <div>
      {data?.map((item) => {
        const [key] = Object.entries(item)[0]
        return (
          <CheckboxForm
            key={key}
            name={key}
            register={register}
            control={control}
            data={data}
          />
        )
      })}
    </div>
  )
}

export default CheckboxList
