import { createRoot } from 'react-dom/client'
import './index.css'

// import StateBasic from './code/3/3-1/stateBasic.tsx'
// import ForList from './code/3/3-2/ForList.tsx'
// import { items } from './code/3/3-2/ForList.tsx'
// import StyledPanel from './code/3/3-3/3-3-1/StyledPanel.tsx'
// import TitledPanel from './code/3/3-3/3-3-2/TitledPanel.tsx'
// import ListTemplate from './code/3/3-3/3-3-3/ListTemplate.tsx'
// import StateBasic from './code/3/3-3/3-3-4/StateBasic.tsx'
// import StateParent from './code/3/3-3/3-3-5/StateParent.tsx'
// import EventMouse from './code/3/3-4/3-4-1/EventMouse.tsx'
// import EventObj from './code/3/3-4/3-4-2/EventObj.tsx'
// import EventPoint from './code/3/3-4/3-4-2/EventPoint.tsx'
// import EventKey from './code/3/3-4/3-4-2/EventKey.tsx'
// import EventArgs from './code/3/3-4/3-4-2/EventArgs.tsx'
// import EventPropagation from './code/3/3-4/3-4-3/EventPropagation.tsx'
// import EventOnce from './code/3/3-4/3-4-4/EventOnce.tsx'
// import EventPassive from './code/3/3-4/3-4-4/EventPassive.tsx'

// import StateForm from './code/4/4-1/4-1-1/StateForm'
// import StateFormUC from './code/4/4-1/4-1-3/StateFormUC'
// import FormTextarea from './code/4/4-1/4-1-4/FormTextarea'
// import FormSelect from './code/4/4-1/4-1-4/FormSelect'
// import FormList from './code/4/4-1/4-1-4/FormList'
// import FormRadio from './code/4/4-1/4-1-4/FormRadio'
// import FormCheck from './code/4/4-1/4-1-4/FormCheck'
// import FormCheckMulti from './code/4/4-1/4-1-4/FormCheckMulti'
// import FormFile from './code/4/4-1/4-1-4/FormFile'

import StateNest from './code/4/4-2/4-2-1/StateNest'
import StateNestImmer from './code/4/4-2/4-2-1/StateNestImmer'
import StateNestImmer2 from './code/4/4-2/4-2-1/StateNestImmer2'
import StateTodo from './code/4/4-2/4-2-3/StateTodo'

const root = createRoot(document.getElementById('root')!)
root.render(
    <>
        <StateTodo />

        <StateNest />

        <StateNestImmer />

        <StateNestImmer2 />
    </>
)
