import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import StateBasic from './code/3/StateBasic.tsx'

import ListTemplate from './code/3/3-3/3-3-3/ListTemplate.tsx'

const root = createRoot(document.getElementById('root')!)
root.render(
    <>
        <StateBasic init={0} />
        <ListTemplate messages={['Message 1', 'Message 2']} >
            {(elem) => (
                <>
                    <dt>Title</dt>
                    <dd>{elem}</dd>
                </>
            )}
        </ListTemplate>
        <StrictMode>
            <App />
        </StrictMode>,
    </>
)
