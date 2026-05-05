import { createRoot } from 'react-dom/client'
import './index.css'

// import StateBasic from './code/3/3-1/stateBasic.tsx'
// import ForList from './code/3/3-2/ForList.tsx'
// import { items } from './code/3/3-2/ForList.tsx'
import StyledPanel from './code/3/3-3/3-3-1/StyledPanel.tsx'
import TitledPanel from './code/3/3-3/3-3-2/TitledPanel.tsx'
import ListTemplate from './code/3/3-3/3-3-3/ListTemplate.tsx'
import StateBasic from './code/3/3-3/3-3-4/StateBasic.tsx'
import StateParent from './code/3/3-3/3-3-5/StateParent.tsx'

const root = createRoot(document.getElementById('root')!)
root.render(
    <>
        <StateParent />

        <StyledPanel>
            <p>This content is displayed inside the panel.</p>
            <p>Multiple children are needed.</p>
        </StyledPanel>

        <TitledPanel>
            <p key="title">This is the title.</p>
            <p>This content is displayed inside the panel.</p>
            <p>Multiple children are needed.</p>
        </TitledPanel>

        <ListTemplate messages={['Message 1', 'Message 2']} >
            {
                (elem) => (
                    <>
                        <dt>Title</dt>
                        <dd>{elem}</dd>
                    </>
                )
            }
        </ListTemplate>

        <StateBasic initialCount={0} />
    </>
)
