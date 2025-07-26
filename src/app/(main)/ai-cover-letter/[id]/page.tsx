import React from 'react'

const CoverLetter = async({ params }: { params: any }) => {

    const { id } = await params;

  return (
    <div>
        Cover Letter Page : {id}
    </div>
  )
}

export default CoverLetter