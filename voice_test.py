import sys
import re
import whisper
import openai
import time
import json
import wave

# OpenAI API 키 설정
openai.api_key = ''

client = openai.OpenAI(
    api_key=''
)
assistant = client.beta.assistants.retrieve(
    assistant_id=''
)
thread = client.beta.threads.create()

def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        time.sleep(0.5)
    return run

def get_response(content):
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role='user',
        content=content
    )

    # Execute our run
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id,
    )

    # Wait for completion
    wait_on_run(run, thread)
    # Retrieve all the messages added after our last user message
    messages = client.beta.threads.messages.list(
        thread_id=thread.id, order="asc", after=message.id
    )
    response_text = ""
    for message in messages:
        for c in message.content:
            response_text += c.text.value
    clean_text = re.sub('【.*?】', '', response_text)
    return clean_text

def transcribe_audio(file_path):
    audio_file = open(file_path, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="text",
        language="ko"
    )
    return transcription

def is_valid_transcription(text):
    # 텍스트가 비어 있거나, 너무 짧거나, 특정 패턴을 포함하는지 확인
    if not text.strip():
        return False
    if len(text.strip()) < 1:  # 텍스트 길이가 너무 짧은 경우
        return False
    # 특정 패턴을 포함하는 경우 (예: 뉴스 앵커 소개와 같은 패턴)
    invalid_patterns = ["MBC", "뉴스", "이덕영", "입니다."]
    if any(pattern in text.lower() for pattern in invalid_patterns):
        return False
    return True

if __name__ == "__main__":
    audio_file_path = sys.argv[1]
    output_file_path = sys.argv[2]

    transcribed_text = transcribe_audio(audio_file_path)
    if not is_valid_transcription(transcribed_text):
        response = "녹음된 내용이 없습니다. 다시 시도해 주세요."
        transcribed_text = ""
    else:
        response = get_response(transcribed_text)
    
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write(f"사용자: {transcribed_text}\n")
        f.write(f"GPT: {response}\n")
