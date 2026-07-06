import { useMemo, useRef, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import type { FilePondFile, FilePondOptions } from 'filepond';

import { Label } from '@/components/ui/label';
import { getCsrfToken } from '@/lib/csrf';
import { paths } from '@/lib/paths';
import { parseStagedUploadToken } from '@/lib/staged-upload';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateType);

const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/epub+zip',
    'application/epub',
    'application/x-epub+zip',
];

const uploadHeaders = () => ({
    'X-CSRF-TOKEN': getCsrfToken(),
    Accept: 'text/plain',
    'X-Requested-With': 'XMLHttpRequest',
});

type BookFilePondUploadProps = {
    inputId?: string;
    existingFileType?: string | null;
    existingFilePath?: string | null;
    error?: string;
    onStagedUploadChange?: (uploadId: string | null) => void;
    onUploadingChange?: (uploading: boolean) => void;
};

function BookFilePondUpload({
    inputId = 'book-file',
    existingFileType,
    existingFilePath,
    error,
    onStagedUploadChange,
    onUploadingChange,
}: BookFilePondUploadProps) {
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const onStagedUploadChangeRef = useRef(onStagedUploadChange);
    const onUploadingChangeRef = useRef(onUploadingChange);

    onStagedUploadChangeRef.current = onStagedUploadChange;
    onUploadingChangeRef.current = onUploadingChange;

    const server = useMemo((): FilePondOptions['server'] => {
        return {
            process: (
                _fieldName,
                file,
                _metadata,
                load,
                processError,
                progress,
                abort,
            ) => {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('file', file, file.name);

                xhr.open('POST', paths.admin.bookUploadProcess);

                for (const [header, value] of Object.entries(uploadHeaders())) {
                    xhr.setRequestHeader(header, value);
                }

                xhr.upload.onprogress = (event) => {
                    progress(event.lengthComputable, event.loaded, event.total);
                };

                xhr.onload = () => {
                    onUploadingChangeRef.current?.(false);

                    if (xhr.status < 200 || xhr.status >= 300) {
                        onStagedUploadChangeRef.current?.(null);
                        processError(
                            xhr.responseText?.trim() || 'Upload failed',
                        );

                        return;
                    }

                    const token = parseStagedUploadToken(xhr.responseText);

                    if (token === null) {
                        onStagedUploadChangeRef.current?.(null);
                        processError('Invalid upload response from server');

                        return;
                    }

                    load(token);
                    onStagedUploadChangeRef.current?.(token);
                };

                xhr.onerror = () => {
                    onUploadingChangeRef.current?.(false);
                    onStagedUploadChangeRef.current?.(null);
                    processError('Upload failed');
                };

                xhr.onabort = () => {
                    onUploadingChangeRef.current?.(false);
                    onStagedUploadChangeRef.current?.(null);
                    abort();
                };

                onUploadingChangeRef.current?.(true);
                xhr.send(formData);

                return {
                    abort: () => xhr.abort(),
                };
            },
            revert: (uniqueId, load, revertError) => {
                const xhr = new XMLHttpRequest();

                xhr.open('DELETE', paths.admin.bookUploadRevert);

                for (const [header, value] of Object.entries(uploadHeaders())) {
                    xhr.setRequestHeader(header, value);
                }

                xhr.onload = () => {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        revertError('Could not remove uploaded file');

                        return;
                    }

                    load();
                    onStagedUploadChangeRef.current?.(null);
                };

                xhr.onerror = () => revertError('Could not remove uploaded file');
                xhr.send(uniqueId);
            },
        };
    }, []);

    const existingFileLabel = useMemo(() => {
        if (existingFilePath) {
            return existingFilePath.split('/').pop() ?? null;
        }

        return existingFileType ? existingFileType.toUpperCase() : null;
    }, [existingFilePath, existingFileType]);

    function handleUpdateFiles(fileItems: FilePondFile[]) {
        setFiles(fileItems);

        if (fileItems.length === 0) {
            onStagedUploadChangeRef.current?.(null);
        }
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={inputId}>Book file</Label>
            {existingFileLabel ? (
                <p className="text-sm text-muted-foreground">
                    Current file:{' '}
                    <span className="font-medium text-foreground">
                        {existingFileLabel}
                    </span>
                    . Upload a new PDF or EPUB to replace it.
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Upload a PDF or EPUB file for this book.
                </p>
            )}
            <FilePond
                id={inputId}
                files={files}
                onupdatefiles={handleUpdateFiles}
                server={server}
                allowMultiple={false}
                instantUpload
                maxFiles={1}
                credits={false}
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
                labelIdle='Drag & drop your book file or <span class="filepond--label-action">Browse</span>'
                labelFileProcessing="Uploading"
                labelFileProcessingComplete="Upload complete"
                labelFileProcessingAborted="Upload cancelled"
                labelFileProcessingError="Error during upload"
                labelTapToCancel="tap to cancel"
                labelTapToUndo="tap to undo"
                labelFileTypeNotAllowed="Only PDF and EPUB files are allowed"
                fileValidateTypeLabelExpectedTypes="Expects PDF or EPUB"
                onremovefile={() => onStagedUploadChangeRef.current?.(null)}
            />
            {error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}

export { BookFilePondUpload };
