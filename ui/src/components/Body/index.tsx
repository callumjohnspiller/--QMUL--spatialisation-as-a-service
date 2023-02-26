import React, {useState} from 'react';
import Uploader from "../Upload";

interface BodyProps {
    uuid: string
}

function Body(props: BodyProps) {
    const [uploadStatus, setUploadStatus] = useState<boolean>(false);

    return (
        <div>
            <Uploader
                uuid={props.uuid}
                setUploadStatus={() => setUploadStatus(true)}
            />
            <div>{uploadStatus ? "state passed successfully" : "you can do it!"}</div>
        </div>
    )
}

export default Body;
