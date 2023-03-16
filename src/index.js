import {intro, outro, select, text} from "@clack/prompts"
import colors from "picocolors"
import { COMMIT_TYPES } from "./commit-types.js"
import { getChangedFiles, getStagedFiles } from "./git.js"
import { trytm } from '@bdsqqq/try'


const [changedFiles,errorChangedFiles] = await trytm(getChangedFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())



intro(`Asistente para la creacion de commits por ${colors.yellow('Felipe Vargas')}`)

if(errorChangedFiles ?? errorStagedFiles){
    outro(colors.red('Error: Comprueba que estas en un repositorio de git'))
    process.exit(1)
}

console.log({changedFiles})
console.log({stagedFiles})

const commitType = await select({
    message:colors.cyan('Selecciona el tipo de commit:'),
    options: Object.entries(COMMIT_TYPES).map(([key,value])=>({
        value:key,
        label: `${value.emoji} ${key} - ${value.description}`
    }))
})

const commitMsg = await text({
    message: "Introduce el mensaje del commit:",
    placeholder: "Add new feature"
})

console.log(commitMsg)

outro("Commit creado con exito. Gracias por usar el asistente!")