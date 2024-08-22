<template>
  <div class="email-sender-container">
    <h1>Email Sender</h1>

    <div class="actions">
      <button @click="selectAll" class="select-button">전체 선택</button>
      <button @click="deselectAll" class="select-button">전체 해제</button>
    </div>

    <div class="writers-list">
      <div
          v-for="writer in writersWithEmail"
          :key="writer.id"
          :class="['writer-button', { selected: isSelected(writer) }]"
          @click="toggleWriterSelection(writer)"
          @dragover.prevent
          @drop="handleDrop($event, writer)"
      >
        <span v-if="isSelected(writer)" class="check-icon">✔</span>
        {{ writer.name }}
      </div>
    </div>

    <div class="compose-section">
      <h2>Compose Email</h2>
      <label for="email-subject">Subject</label>
      <input id="email-subject" v-model="emailSubject" placeholder="Enter email subject" />

      <label for="email-content">Message</label>
      <textarea
          id="email-content"
          v-model="emailContent"
          placeholder="Enter your message!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
          @input="autoResize"
      ></textarea>
    </div>

    <form ref="emailForm" @submit.prevent="sendEmails">
      <div class="attachment-list">
        <div
            v-for="writer in selectedWriters"
            :key="writer.id"
            class="attachment-section"
            @dragover.prevent
            @drop="handleDrop($event, writer)"
        >
          <h3>{{ writer.name }} ({{ writer.email.trim() }})</h3>
          <div
              class="drop-area"
              @click="triggerFileInput(writer)"
          >
            <input
                type="file"
                multiple
                accept="application/pdf"
                :name="'attachments_' + writer.email.trim()"
                @change="onFileChange($event, writer)"
                class="file-input"
                :ref="getFileInputRef(writer)"
            />
            <span>파일을 이곳에 드래그하거나 클릭하여 업로드하세요</span>
          </div>
          <ul v-if="attachments[writer.email.trim()]?.length" class="file-list">
            <li
                v-for="(file, index) in attachments[writer.email.trim()]"
                :key="file.name"
                class="file-item"
            >
              {{ file.name }}
              <button @click.stop="removeFile(writer.email.trim(), index)" class="remove-button">제거</button>
            </li>
          </ul>
        </div>
      </div>
      <div class="progress-container">
        <div id="progress-bar" class="progress-bar"></div>
      </div>
      <button type="submit" class="submit-button">Send Emails</button>
    </form>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import {useStore} from "vuex";
import axios from "axios";

const store = useStore();
const emailForm = ref(null);

onMounted(async () => {
  await store.dispatch("fetchAuthors");
  selectAll(); // 페이지 로드 시 모든 작가를 기본 선택 상태로 설정
});

// 이메일이 있는 작가들만 필터링
const writersWithEmail = computed(() => {
  return store.state.authors
      .filter(writer => writer.email)
      .sort((a, b) => a.name.localeCompare(b.name)); // 이름을 알파벳 순으로 정렬
});
const selectedWriters = ref([]);
const emailSubject = ref('');
const emailContent = ref('');
const attachments = ref({});
const fileInputs = ref({});

const isSelected = (writer) => selectedWriters.value.includes(writer);

const toggleWriterSelection = (writer) => {
  if (isSelected(writer)) {
    selectedWriters.value = selectedWriters.value.filter(w => w !== writer);
  } else {
    selectedWriters.value.push(writer);
  }
};

const selectAll = () => {
  selectedWriters.value = [...writersWithEmail.value];
};

const deselectAll = () => {
  selectedWriters.value = [];
};

const ensureAttachmentArray = (email) => {
  if (!attachments.value[email]) {
    attachments.value[email] = [];
  }
};

const updateAttachments = (email, files) => {
  ensureAttachmentArray(email);
  attachments.value[email] = [...attachments.value[email], ...files];
  attachments.value = {...attachments.value};
};

const onFileChange = (event, writer) => {
  const email = writer.email.trim();
  const files = Array.from(event.target.files);
  if (files.length) {
    updateAttachments(email, files);
  }
};

const handleDrop = (event, writer) => {
  event.preventDefault();
  const email = writer.email.trim();
  const files = Array.from(event.dataTransfer.files);
  if (files.length) {
    updateAttachments(email, files);
  }
};

const triggerFileInput = (writer) => {
  const email = writer.email.trim();
  const fileInputRef = fileInputs.value[email];
  if (fileInputRef) {
    fileInputRef.click();
  }
};

const removeFile = (email, index) => {
  attachments.value[email].splice(index, 1);
  attachments.value = {...attachments.value};
};

const getFileInputRef = (writer) => {
  return (el) => {
    const email = writer.email.trim();
    if (el) {
      fileInputs.value[email] = el;
    }
  };
};
const calculateTotalSize = (selectedWriters, attachments) => {
  let totalSize = 0;

  selectedWriters.forEach(writer => {
    const emailAttachments = attachments[writer.email.trim()];
    if (emailAttachments) {
      emailAttachments.forEach(file => {
        totalSize += file.size; // 파일 크기를 합산
      });
    }
    totalSize += new Blob([emailSubject.value, emailContent.value]).size; // 이메일 제목과 내용 크기 추가
  });

  return totalSize;
};
function updateProgressBar(progressBar, loaded, total) {
  const percentage = Math.round((loaded / total) * 100);
  progressBar.style.width = `${percentage}%`;
  progressBar.innerText = `${percentage}%`;

  // 클라이언트에서 조금씩 진행바를 업데이트
  requestAnimationFrame(() => {
    progressBar.style.width = `${percentage}%`;
    progressBar.innerText = `${percentage}%`;
  });
}

const sendEmails = async () => {
  try {
    const progressBar = document.getElementById('progress-bar');
    let totalEmails = selectedWriters.value.length;
    let completedEmails = 0;
    let totalProgress = 0;

    for (const writer of selectedWriters.value) {
      const formData = new FormData();

      formData.append('to', writer.email.trim());
      formData.append('subject', emailSubject.value);
      formData.append('message', emailContent.value);

      const emailAttachments = attachments.value[writer.email.trim()];
      if (emailAttachments) {
        emailAttachments.forEach((file) => {
          formData.append('attachments[]', file);
        });
      }

      const response = await axios.post('http://43.201.56.74:3000/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status !== 'success') {
        throw new Error('Failed to initiate email: ' + response.data.message);
      }

      const eventSource = new EventSource(`http://43.201.56.74:3000/progress/${response.data.id}`);

      eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);

        if (data.status === 'progress') {
          updateProgressBar(progressBar, data.percentage, 100);
        }

        if (data.status === 'complete') {
          completedEmails++;
          eventSource.close();

          if (completedEmails === totalEmails) {
            progressBar.style.width = `100%`;
            progressBar.innerText = `100%`;
            alert('All emails sent successfully.');
          }
        }

        if (data.status === 'error') {
          eventSource.close();
          alert('Failed to send email');
        }
      };

    }

  } catch (error) {
    alert('Failed to send emails: ' + error.message);
  }
};



// textarea 크기 자동 조절 함수
const autoResize = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto'; // 먼저 높이를 auto로 설정
  textarea.style.height = `${textarea.scrollHeight}px`; // 스크롤 높이에 맞춰 높이 설정
};
</script>

<style scoped>
.email-sender-container {
  max-width: 1600px;
  margin: 2rem auto;
  background-color: #f6f6f6;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.actions {
  margin-bottom: 1rem;
}

.select-button {
  background-color: #00c73c;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.select-button:hover {
  background-color: #009628;
}

.writers-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* 왼쪽 정렬 */
  margin-bottom: 2rem;
}

.writer-button {
  background-color: #e0e0e0;
  color: #333;
  padding: 0.5rem;
  margin: 0.3rem;
  border-radius: 8px;
  cursor: pointer;
  width: 150px; /* 고정된 너비 */
  text-align: center;
  position: relative;
  font-size: 0.85rem;
  box-sizing: border-box; /* 패딩 포함하여 너비 계산 */
}

.writer-button.selected {
  background-color: #00c73c;
  color: white;
}

.check-icon {
  position: absolute;
  left: 10px;
  font-size: 1rem;
}

.compose-section {
  margin-top: 2rem;
  text-align: left;
}

.compose-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.compose-section label {
  font-weight: bold;
  display: block;
  margin-top: 1rem;
}

.compose-section input,
.compose-section textarea {
  width: 600px; /* 고정된 가로 크기 */
  padding: 0.8rem;
  margin-top: 0.3rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.compose-section textarea {
  max-height: 300px; /* 최대 높이 */
  overflow-y: auto; /* 최대 높이 넘으면 스크롤 */
  resize: none; /* 사용자가 직접 크기 조절 못하도록 */
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.attachment-section {
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.attachment-section h3 {
  margin-bottom: 0.5rem;
  color: #555;
  text-align: left;
}

.drop-area {
  border: 2px dashed #00c73c;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9f9f9;
  cursor: pointer;
  text-align: center;
}

.drop-area span {
  display: block;
  margin-top: 0.5rem;
  color: #999;
}

.file-list {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  text-align: left;
}

.file-item {
  background-color: #f1f1f1;
  margin-bottom: 0.3rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-button {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.remove-button:hover {
  background: #c0392b;
}

.file-input {
  display: none;
}

.submit-button {
  background-color: #00c73c;
  color: white;
  padding: 0.8rem 1.5rem;
  margin-top: 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-button:hover {
  background-color: #009628;
}
.progress-container {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-bar {
  width: 0;
  height: 20px;
  background-color: #00c73c;
  text-align: center;
  color: white;
  line-height: 20px;
  transition: width 0.4s ease;
}

</style>
