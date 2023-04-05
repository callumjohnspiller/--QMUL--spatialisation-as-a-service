import React, { ChangeEvent, FC, FunctionComponent, useState } from 'react';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../libs/s3Client";
import {
	FormControl, Input,
	Button,
	MenuItem,
	Select,
	SelectChangeEvent, Typography, Stepper, Step, StepLabel, StepContent
} from '@mui/material';

interface UploaderProps {
  setStemCount: Function;
  setUploadStatus: Function;
  stemCount: string | number;
  uuid: string;
}

function Uploader(props: UploaderProps) {
	const [file, setFile] = useState<File>();
	const [validFile, setValidFile] = useState<boolean>(true);
	const [activeStep, setActiveStep] = React.useState(0);

	const steps = ['Choose file', 'Choose number of stems', 'Confirm']

	const handleNextStep = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			switch (event.target.files[0].type) {
			case "audio/x-wav":
				setFile(event.target.files[0]);
				setValidFile(true);
				break;
			case "audio/mpeg":
				setFile(event.target.files[0]);
				setValidFile(true);
				break;
			default:
				setValidFile(false);
			}
		}
	};

	const handleStemCountChange = (event: SelectChangeEvent<typeof props.stemCount>) => {
		props.setStemCount(event.target.value);
	};

	const handleUploadClick = async () => {
		if (!file || !props.stemCount) {
			return;
		}

		const params = {
			Bucket: "saas-deposit",
			Key: "upload_" + props.uuid,
			Body: file
		};

		try {
			await s3Client.send(new PutObjectCommand(params));
		} catch (err) {
			console.log("Error", err);
		}

		props.setUploadStatus(true);
	};

	const inputStep = () => {
		return (
			<div>
				<Input
					type="file"
					onChange={handleFileChange}
					disableUnderline={true}
				/>
				{
					(!validFile) ? <Typography color={'red'}>Please upload either a .wav or .mp3 file</Typography> : <div></div>
				}
				{
					(validFile) ? <Typography>{file && `${file.name} - ${file.type}`}</Typography> : <div></div>
				}
			</div>
		)
	}

	const stemStep = () => {
		return (
			<div>
				{
					(validFile) ? <FormControl>
							<Typography>How many parts do you want this file separated into?</Typography>
							<Select
								labelId='demo-simple-select-label'
								id='demo-simple-select'
								value={props.stemCount}
								onChange={handleStemCountChange}
							>
								<MenuItem value={2}>Two</MenuItem>
								<MenuItem value={4}>Four</MenuItem>
							</Select>
						</FormControl>
						:
						<div></div>
				}
			</div>
		)
	}

	const submitStep = () => {
		return (
			<div>
				{(file && validFile) ? <div></div> : <div><Typography color={'red'}>Please upload a valid file and choose the number of stems you would like it split into</Typography></div> }
			</div>
		)
	}

	const stepContent = [inputStep(), stemStep(), submitStep()]

	return (
		<div style={{
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginBottom: 'auto',
			marginTop: 'auto',
			width: '60%',
			padding: 100
		}}>
			<Stepper activeStep={activeStep}>
				{steps.map((label, index) => {
					const stepProps: { completed?: boolean } = {};
					const labelProps: {
						optional?: React.ReactNode;
					} = {};
					return (
						<Step key={label} {...stepProps}>
							<StepLabel {...labelProps}>{label}</StepLabel>
							<StepContent>
								{stepContent[index]}
							</StepContent>
						</Step>
					);
				})}
			</Stepper>
			{activeStep === steps.length ? (
				<React.Fragment>
					<Typography sx={{ mt: 2, mb: 1 }}>
						All steps completed - you&apos;re finished
					</Typography>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						<div style={{ flex: '1 1 auto' }} />
						<Button onClick={handleReset}>Reset</Button>
					</div>
				</React.Fragment>
			) : (
				<React.Fragment>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						<Button
							color="inherit"
							disabled={activeStep === 0}
							onClick={handleBack}
							sx={{ mr: 1 }}
						>
							Back
						</Button>
						<div style={{ flex: '1 1 auto' }} />
						{
							activeStep === steps.length - 1 ? <Button onClick={handleUploadClick}>Finish and Upload</Button> : <Button onClick={handleNextStep}>Next</Button>
						}
					</div>
				</React.Fragment>
			)
			}
		</div>
	);
}

export default Uploader;
