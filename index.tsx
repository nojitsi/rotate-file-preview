import React from 'react'
import loadImage from 'blueimp-load-image'

const FILE_INPUT_ID = 'multiple-file-rotate-input'
const FILE_INPUT_CONTAINER_ID = 'multiple-file-rotate-input-container'
const FILE_INPUT_CONTAINER_TITLE_ID =
  'multiple-file-rotate-input-container-title'
const FILE_INPUT_IMAGE_ID_PREFIX = 'multiple-file-rotate-input-image-'

const FILE_INPUT_IMAGE_CONTAINER_CLASS_NAME = 'file-input-container'
const FILE_INPUT_IMAGE_ITEM_CLASS_NAME = 'file-input-image-item'
const FILE_INPUT_IMAGE_ITEM_CLOSE_BTN_CLASS_NAME = 'close-btn'
const FILE_INPUT_IMAGE_ITEM_ROTATE_BTN_CLASS_NAME = 'rotate-btn'

const FILE_INPUT_IMAGE_INDEX_DATA_ATTRIBUTE_NAME = 'data-index'
const ROTATE_LEFT_POSITION_INDEX = 8

const getFileInpuntImageId = (index: number) =>
  `${FILE_INPUT_IMAGE_ID_PREFIX}${index}`

export const fileInputLinks = () => [
  { rel: 'stylesheet', href: 'styles/index.css' },
]

type FileInputProps = { 
  label: string,
  refreshIconPath: string,
  closeIconPath: string
}
export class FileInput extends React.Component<FileInputProps> {
  constructor(props: FileInputProps) {
    super(props)
  }

  static defaultProps = { 
    label: 'Click to upload files',
    refreshIconPath: '/img/icons/refresh.webp',
    closeIconPath: '/img/icons/close.webp'
  };

  componentDidMount() {
    const fileInput = document.getElementById(FILE_INPUT_ID) as HTMLInputElement
    const fileInputContainer = document.getElementById(
      FILE_INPUT_CONTAINER_ID,
    ) as HTMLElement
    const fileInputContainerTitle = document.getElementById(
      FILE_INPUT_CONTAINER_TITLE_ID,
    ) as HTMLElement

    const clearFilePreviews = () => {
      const filePreviews = document.querySelectorAll(
        `.${FILE_INPUT_IMAGE_CONTAINER_CLASS_NAME} .${FILE_INPUT_IMAGE_ITEM_CLASS_NAME}`,
      )

      for (const filePreview of filePreviews) {
        filePreview.remove()
      }
    }

    const renderFilePreviews = (files: FileList) => {
      //iterable index
      let fileId = 0

      for (const file of files) {
        const filePreviewItemContainer = document.createElement('div')
        filePreviewItemContainer.classList.add(FILE_INPUT_IMAGE_ITEM_CLASS_NAME)
        filePreviewItemContainer.setAttribute(
          FILE_INPUT_IMAGE_INDEX_DATA_ATTRIBUTE_NAME,
          `${fileId}`,
        )

        const filePreviewImg = document.createElement('img')
        ;(filePreviewImg.id = getFileInpuntImageId(fileId)),
          (filePreviewImg.src = URL.createObjectURL(file))
        filePreviewImg.onclick = event => {
          event.stopPropagation()
        }

        const getFileContainerId = (target: HTMLElement): number => {
          const fileId = target.parentElement?.parentElement?.getAttribute(
            FILE_INPUT_IMAGE_INDEX_DATA_ATTRIBUTE_NAME,
          )

          if (!fileId) {
            throw Error('No file id found pls contact admin')
          }

          return parseInt(fileId)
        }

        const filePreviewItemContainerRotateBtn = document.createElement('div')
        filePreviewItemContainerRotateBtn.classList.add(
          FILE_INPUT_IMAGE_ITEM_ROTATE_BTN_CLASS_NAME,
        )
        const rotateBtnImg = document.createElement('img')
        rotateBtnImg.src = this.props.refreshIconPath
        filePreviewItemContainerRotateBtn.appendChild(rotateBtnImg)

        filePreviewItemContainerRotateBtn.onclick = async event => {
          event.stopPropagation()
          const target = event.target as HTMLImageElement

          const fileId = getFileContainerId(target)


          loadImage(
            (fileInput.files as any)[fileId],
            async (rotatedImgFile: any, data: any) => {
              const dataTransfer = new DataTransfer()

              //set rotated image to preview
              const imagePreviewHTMLElement = document.getElementById(
                getFileInpuntImageId(fileId),
              ) as HTMLImageElement
              const rotatedImageContentBase64 = rotatedImgFile.toDataURL()
              imagePreviewHTMLElement.src = rotatedImageContentBase64

              //update file input content
              let index = 0
              for (const imgFile of fileInput.files as FileList) {
                if (index !== fileId) {
                  dataTransfer.items.add(imgFile)
                } else {
                  await new Promise(res =>
                    rotatedImgFile.toBlob(function (blob: any) {
                      let rotatedFile = new File([blob], imgFile.name, {
                        type: imgFile.type,
                      })
                      dataTransfer.items.add(rotatedFile)
                      res(0)
                    }, file.type),
                  )
                }
                index++
              }

              fileInput.files = dataTransfer.files
            },
            { orientation: ROTATE_LEFT_POSITION_INDEX },
          )
        }

        const filePreviewItemContainerCloseBtn = document.createElement('div')
        filePreviewItemContainerCloseBtn.classList.add(
          FILE_INPUT_IMAGE_ITEM_CLOSE_BTN_CLASS_NAME,
        )
        const closeBtnImg = document.createElement('img')
        closeBtnImg.src = this.props.closeIconPath
        filePreviewItemContainerCloseBtn.appendChild(closeBtnImg)
        filePreviewItemContainerCloseBtn.onclick = async event => {
          event.stopPropagation()
          const target = event.target as HTMLImageElement

          const fileId = getFileContainerId(target)

          const dataTransfer = new DataTransfer()

          //remove preview container
          target.parentElement?.parentElement?.remove()
          const fileInputContainer = document.getElementById(
            FILE_INPUT_CONTAINER_ID,
          ) as HTMLElement

          let oldIndex = 0
          let newIndex = 0
          for (const imgFile of fileInput.files as FileList) {
            if (oldIndex !== fileId) {
              dataTransfer.items.add(imgFile)
              const fileImageItemContainer =
                fileInputContainer.children[newIndex + 1]
              fileImageItemContainer.setAttribute('data-index', `${newIndex}`)
              const imagePreview =
                fileImageItemContainer.getElementsByTagName('img')[0]
              imagePreview.id = getFileInpuntImageId(newIndex)
              newIndex++
            }
            oldIndex++
          }

          fileInput.files = dataTransfer.files
          if (!fileInput.files.length) {
            fileInputContainerTitle.classList.remove('hidden')
          }
        }

        filePreviewItemContainer.appendChild(filePreviewImg)
        filePreviewItemContainer.appendChild(filePreviewItemContainerRotateBtn)
        filePreviewItemContainer.appendChild(filePreviewItemContainerCloseBtn)
        fileInputContainer.appendChild(filePreviewItemContainer)

        fileId++
      }
    }

    fileInput.onchange = event => {
      const files = fileInput.files
      if (files && files.length) {
        clearFilePreviews()
        renderFilePreviews(files)

        fileInputContainerTitle.classList.add('hidden')
      }
    }

    fileInputContainer.onclick = event => {
      fileInput.click()
    }
  }

  render() {
    return (
      <div>
        <div
          id={FILE_INPUT_CONTAINER_ID}
          className="file-input-container container center"
        >
          <div
            className="file-input-container-title"
            id={FILE_INPUT_CONTAINER_TITLE_ID}
          >
            {this.props.label}
          </div>
        </div>
        <input
          accept="image/png, image/webp, image/jpeg"
          type="file"
          id={FILE_INPUT_ID}
          multiple={true}
          name="images"
          hidden
        />
      </div>
    )
  }
}
