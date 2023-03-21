import {intro, outro, select, text, confirm, multiselect, isCancel} from "@clack/prompts"
import colors from "picocolors"
import { COMMIT_TYPES } from "./commit-types.js"
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit } from "./git.js"
import { trytm } from '@bdsqqq/try'


const [changedFiles,errorChangedFiles] = await trytm(getChangedFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())



intro(`Asistente para la creacion de commits por ${colors.yellow('Felipe Vargas')}`)

if(errorChangedFiles ?? errorStagedFiles){
    outro(colors.red('Error: Comprueba que estas en un repositorio de git'))
    process.exit(1)
}

if(stagedFiles.length === 0 && changedFiles.length > 0 ){
    const files = await multiselect({
        message: colors.cyan('Selecciona los ficheros que quieres agregar al commit:'),
        options: changedFiles.map(file=>({
            value: file,
            label: file
        }))
    })
    
    if(isCancel(files)){
        outro(colors.yellow('No hay archivos para commitear'))
        process.exit(0)
    }

    await gitAdd({files})
}

console.log({changedFiles})
console.log({stagedFiles})

const commitType = await select({
    message:colors.cyan('Selecciona el tipo de commit:'),
    options: Object.entries(COMMIT_TYPES).map(([key,value])=>({
        value:key,
        label: `${value.emoji} ${key.padEnd(8,' ')} - ${value.description}`
    }))
})

const commitMsg = await text({
    message: colors.cyan("Introduce el mensaje del commit:"),
    validate: (value)=>{
        if(value.length === 0){
            return colors.red('El mensaje no puede estar vacio')
        }
        if(value.length > 50){
            return colors.red('El mensaje no puede tener mas de 50 caracteres')
        }
    }
    // placeholder: "Add new feature"
})

const {emoji,release} = COMMIT_TYPES[commitType]

let breakingChange = false
if(release){
    breakingChange = await confirm({
        initialValue:false,
        message: `${colors.cyan('Tiene este commit cambios que rompen la compatibilidad anterior?')}
            ${colors.yellow('Si la respuesta es si, deberias crear un commit con el tipo "BREAKING CHANGE" y al hacer release se publicara una version major')}
        `
    })
}

let commit = `${emoji} ${commitType}: ${commitMsg}`
commit = breakingChange ? `${commit} [breaking change]` : commit

const shouldContinue = await confirm({
    initialValue:true,
    message: `${colors.cyan('Quieres crear el commit con el siguiente mensaje?')}
    ${colors.green(colors.bold(commit))}
    Confirmas?`
})

if(!shouldContinue){
    outro(colors.yellow('No se ha creado el commit'))
    process.exit(0)
}

await gitCommit({commit})

outro(colors.green("✅ Commit creado con exito. Gracias por usar el asistente!"))