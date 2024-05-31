const userID = document.getElementById("userID").value;
const userPassword = document.getElementById("uesrPassword").value;

function validateForm() {
            var userID = document.getElementById("userID").value;
            var userPassword = document.getElementById("userPassword").value;
            
            // 아이디 길이 검증
            if (userID.length < 6 || userID.length > 20) {
                alert("아이디는 6글자 이상 20글자 이하로 작성해주세요.");
                return false;
            }
            
            // 비밀번호 길이 검증
            if (userPassword.length < 8 || userPassword.length > 16) {
                alert("비밀번호는 8글자 이상 16글자 이하로 작성해주세요.");
                return false;
            }
            
            return true;
        }