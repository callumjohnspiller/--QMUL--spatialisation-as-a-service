import React, {useState} from 'react';
import Uploader from "../Upload";

interface BodyProps {
    uuid: string
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);

    if (uploadStatus) {
        const queueURL = "";
    }

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
        </div>
    )
}

export default Body;
