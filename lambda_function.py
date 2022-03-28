#based on example from https://www.learnaws.org/2020/12/18/aws-ses-boto3-guide/#sending-a-html-email
#https://github.com/furas/python-examples/blob/master/decode-encode/base64-tiff-png-jpg-html/main-jpg.py
#https://stackoverflow.com/questions/46319178/python-send-email-with-base64-encoded-image-as-attachment
#throws 500 errors when input syntax is off, enable print()s and check cloudwatch logs for outputs

from email import encoders
from email.mime.base import MIMEBase
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import boto3
import json
import base64
import os

def lambda_handler(event, context):

    #Scrub event input - postman fixes add here
    #print("event var contains", event)
    
    #define hardcode from and to addys in env vars
    fromEmail = os.environ['FromEmail']
    toEmail = os.environ['ToEmail']
    
    #Scrub body clean, remove signature as it's own element
    popped = event.pop('body')
    poppedjson = json.loads(popped) #workaround for weird string conversion AWS
    signat = poppedjson.pop('sigimage')
    clientEmail = poppedjson.pop('Email')


    #iterate elements        
    #print(poppedjson)
    def dirtyBody(poppedjson):
        return ( "<br />".join([str(i[0])+": "+str(i[1]) for i in poppedjson.items()]) )

    #Scrub content and add html wrapper
    washedBody = '<html><body><h1>The Repair Lady Drop Off Confirmation</h1><p style="font-size:1.5em;">' + json.dumps(dirtyBody(poppedjson)) + '</p></body></html>'
    #print(washedBody)

    #convert to json for writing to email, remove backticks
    cleanBody = json.dumps(washedBody)
    cleanBody2 = washedBody.replace("\"", "")
    signats = json.dumps(signat)

    #build email header structure
    msg = MIMEMultipart()
    msg["Subject"] = "Repair Lady drop off Confirmation"
    msg["From"] = fromEmail
    msg["To"] = toEmail
    msg["Cc"] = clientEmail

    # Set message body
    body = MIMEText(cleanBody2, "html")
    msg.attach(body)

    #build signature as attachment
    signatFile = signats.split('base64,')[1]
    signatFile = base64.b64decode(signatFile)

    part = MIMEApplication(signatFile)
    part.add_header("Content-Disposition", "attachment", filename="signature.png")
    msg.attach(part)

    # Convert message to string and send
    ses_client = boto3.client("ses")
    response = ses_client.send_raw_email(
        Source=fromEmail,
        Destinations=[toEmail],
        RawMessage={"Data": msg.as_string()}
    )
    print(response)
    
    #return crap to remove form error after send
    return {
    'statusCode': 200,
    'body': json.dumps('Successfully sent email')
    }