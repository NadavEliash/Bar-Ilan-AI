import { useEffect, useRef, useState } from 'react';
import './App.css';
import ErrorMsg from './components/ErrorMsg';


const files = [
  {
    src: "/blur.jpg",
    name: 'blurred-id',
    type: "image",
    url: "2.jpg"
  },
  {
    src: "/id.jpg",
    name: 'id',
    type: "image",
    url: "1.jpg"
  },
  {
    src: "/3.jpg",
    name: '3',
    type: "image",
    url: "3.jpg"
  },
]

function App() {
  const inputRef = useRef()

  const [objectURL, setObjectURL] = useState(null)
  const [parsedContent, setParsedContent] = useState('')
  const [description, setDescription] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isPdf, setIsPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)


  useEffect(() => {
    if (parsedContent.length > 0) {

      const replaceHyphens = parsedContent.replace(/_/gi, ' ')
      const description = replaceHyphens.split("#")
      const lines = description.map(line => line.split("%"))

      setDescription(lines)
    }
  }, [parsedContent])

  const handleInputChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      let newImage = new Image();
      newImage.src = URL.createObjectURL(file);

      newImage.onload = () => {
        setObjectURL(newImage.src)
        setImageSize({ width: newImage.width, height: newImage.height })
      }
    }
  }

  const onFileSelected = async (file) => {
    setIsLoading(true)
    setIsPdf(file.type === 'pdf')
    setObjectURL(file.src)

    getFileDescription(file.url)
  }

  const getFileDescription = async (url) => {
    setParsedContent('')
    setIsLoading(true)

    fetch(`https://1ln7bb9kb2.execute-api.us-east-1.amazonaws.com/test?image_name=${url}`, {
      mode: 'cors',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.body) {
          throw new Error('No response body or readable stream not supported.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let result = '';


        return reader.read().then(function processStream({ done, value }) {
          if (done) {
            return result
          }

          result += decoder.decode(value, { stream: true });
          return reader.read().then(processStream);
        });
      })

      .then((data) => {
        
        // ## OLD RESPONSE

        // const firstScopeRegex = /^\{"[^"]+":\s*(\{[\s\S]*\})\}$/
        // const match = data.match(firstScopeRegex)

        // if (match) {
        //   const content = match[1]
        //   const jsonData = JSON.parse(content)

        //   setParsedContent(parseResponse(jsonData))
        // } else {
        //   setIsError(true)
        //   setErrorMsg(data)
        // }

        data = Object.values(data)[0]
        try {
          const parsedData = JSON.parse(data)
          setParsedContent(parseResponse(parsedData))
        
        } catch (error) {
          setParsedContent(parseResponse(data))
        }

        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error:', err)
        setIsLoading(false)
        setIsError(true)
      })
  }

  const parseResponse = (content) => {
    let str = ''

    if (Array.isArray(content)) {
      content.forEach(element => {
        typeof element !== 'object'
          ? str += element + "#"
          : str += parseResponse(element)
      })

    } else if (typeof content === 'object') {
      Object.values(content).map((val, idx) => {
        typeof val !== 'object'
          ? str += Object.keys(content)[idx] + ': %' + val + "#"
          : str += Object.keys(content)[idx] + ': #' + parseResponse(val)
      }

      )

    } else {
      str += content + "#"
    }

    return str
  }

  return (
    <div className="App assistant-font" dir='rtl'>
      <div className='logo-bar'>
        <img src='/logo.svg' alt='logo' />
      </div>

      <div className='top-box'>
        <div className='title-box'>
          <div className='title'>
            <div className='scanner-img'>
              <img src='/scanner.svg' alt='scanner' />
            </div>
            <h2>סריקת מסמכים</h2>
          </div>
          <div className='secondary'>
            <p>סורק מסמכים זה מדגים יכולות מתקדמות של עיבוד תמונה וחילוץ נתונים. בחר תמונה כדי לראות את המידע והניתוח שחולצו. המערכת יכולה לטפל בסוגי מסמכים שונים לרבות תעודות זהות, תעודות וטפסים רשמיים.</p>
          </div>
        </div>
        <button className='back-button assistant-font'>חזרה לתפריט ראשי
          <img src='/arrow.svg' alt='<-' style={{ width: '24px' }} />
        </button>
      </div>

      <div className='boxes-line'>
        {files.map(file =>
          <div className='demo-box' key={file.name} id={file.name} onClick={() => { onFileSelected(file) }}>
            {file.type === 'image'
              ? <img className='demo-display' src={file.src} alt='img' />
              : <embed className='demo-display demo-pdf' src={file.src} />
            }

          </div>
        )}
      </div>

      {/* <div className='input-line' onClick={() => inputRef.current?.click()}>
        <p className='select-file'>בחר קובץ</p>
        <input ref={inputRef} type='file' name='upload' onChange={handleInputChange} className={`${objectURL ? '' : 'no-file'}`} />
      </div> */}

      {
        objectURL &&
        <div className='display-box'>
          <div className='image-container'>
            {isPdf
              ? <embed className={`pdf-preview ${isLoading ? 'loading' : ''}`} src={objectURL + "#toolbar=0&scrollbar=0"} />
              : <img className={`image-preview ${imageSize.width > imageSize.height ? 'horizontal' : 'vertical'} ${isLoading ? 'loading' : ''}`} src={objectURL} alt='image' />}
            {isLoading && <img className='loader' src='/loader.gif' alt='loader' />}
          </div>
          <div className='description-container scrollbar'>
            {description.length > 0 &&
              <div className='description'>
                {
                  description.map((line, idx) =>
                    <p key={idx}>{line[0]} <span>{line[1]}</span></p>)
                }
              </div>}
          </div>
        </div>
      }

      {isError &&
        <>
          <ErrorMsg setIsError={setIsError} errorMsg={errorMsg} />
        </>
      }
    </div>

  );
}

export default App;
