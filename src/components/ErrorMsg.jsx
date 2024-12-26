import React from 'react'

export default function ErrorMsg({ setIsError, errorMsg = '' }) {
    return (
        <div className='error-msg'>
            <div className='x' onClick={() => setIsError(false)}>
                <img src="/x.svg" alt="x" />
            </div>
            <p>
                {errorMsg.length > 0
                    ? errorMsg
                    : 'לא ניתן לעבד את התמונה'}
            </p>
        </div>
    )
}
