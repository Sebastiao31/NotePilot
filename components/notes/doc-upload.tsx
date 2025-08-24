import React from 'react'
import Image from 'next/image'

const DocUpload = () => {
  return (
    <main>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-6 px-6 border-2 border-dashed border-gray-300">
            <Image
            className="mb-4"
            src="/Fileicon_Secundary.svg"
            alt="File"
            width={35}
            height={35}
            priority
            />
            <h1 className="text-md font-medium text-center">
                Drag & Drop or Click to Upload
            </h1>
            <p className="text-sm text-gray-500 text-center">
                File Format: PDF, DOCX
            </p>

        </div>
    </main>
  )
}

export default DocUpload