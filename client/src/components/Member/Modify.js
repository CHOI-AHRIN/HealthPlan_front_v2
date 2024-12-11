import axios from 'axios';
import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

const Modify = () => {

    const [uuid, setUuid] = useState(cookie.load('uuid'));
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mno, setMno] = useState('');
    const [phone, setPhone] = useState('');
    const [authCode, setAuthCode] = useState('');

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingEmailOpen, setIsEditingEmailOpen] = useState(false);
    const [initialEmail, setInitialEmail] = useState(''); // 초기 이메일 상태




    useEffect(() => {
        callModifyInfoApi();
    }, []);


    // 이메일 마스킹 함수
    const maskEmail = (email) => {
        if (!email || !email.includes('@')) {
            return '알 수 없음';
        }
        const [localPart, domainPart] = email.split('@'); // 로컬과 도메인 분리
        const maskedLocalPart = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2);
        const [domainName, domainExt] = domainPart.split('.'); // 도메인 이름과 확장자 분리
        const maskedDomain = domainName.slice(0, 1) + '*'.repeat(domainName.length - 1);
        return `${maskedLocalPart}@${maskedDomain}.${domainExt}`;
    };

    const callModifyInfoApi = () => {

        // 1. 쿠키에서 토큰 가져오기 
        const token = cookie.load('token');

        // 2. token을 서버로 보내고 uuid를 받아오기
        axios
            .post('/api/member/loginCookie', {

                token: token
            }).then(response => { // then 함수 안에서 다시 호출
                const uuid = response.data.uuid;

                // 3. 받아온 데이터를 통해 정보 조회
                axios.post('/api/member/read', {
                    uuid: uuid // 받은 uuid를 다시 서버로 전송

                }).then(response => {
                    try {
                        const data = response.data;
                        setUuid(data.uuid);      // 회원 아이디
                        setName(data.name);      // 회원 이름
                        setEmail(data.email);    // 회원 이메일
                        $('#email_val').val(data.email);
                        setPhone(data.phone);    // 연락처
                        $('#phone_val').val(data.phone);
                        setMno(data.mno);        // 회원 번호
                    }
                    catch (error) {
                        alert('회원데이터를 읽어오는 중에 오류가 발생했습니다.');
                    }
                }).catch(error => { alert('토큰을 확인하는 중에 오류가 발생했습니다.'); return false; });
            })
    };

    const fnSignInsert = (type, e) => {
        let jsonstr = $("form[name='frm']").serialize();
        jsonstr = decodeURIComponent(jsonstr);
        let Json_form = JSON.stringify(jsonstr).replace(/\"/gi, '');
        Json_form = "{\"" + Json_form.replace(/\&/g, '\",\"').replace(/=/gi, '\":"') + "\"}";
        let Json_data = JSON.parse(Json_form);

        axios.post('/api/member/modify', Json_data)
            .then(response => {
                try {
                    if (response.data === "SUCCESS") {
                        if (type === 'modify') {
                            sweetalertModify('수정되었습니다. \n 다시 로그인해주세요.', '', 'success', '확인');
                        }
                    }
                } catch (error) {
                    alert('1. 작업중 오류가 발생하였습니다.');
                }
            })
            .catch(error => {
                alert('2. 작업중 오류가 발생하였습니다 (서버).');
                return false;
            });
    };

    const submitClick = (type, e) => {
        const memPw_val_checker = $('#upw').val();
        const memPw_cnf_val_checker = $('#upw_cnf_val').val();
        const email_val_checker = $('#email_val').val();
        const phone_val_checker = $('#phone_val').val();

        const fnValidate = (e) => {
            const pattern1 = /[0-9]/;
            const pattern2 = /[a-zA-Z]/;
            const pattern3 = /[~!@#$%^&*()_+|<>?:{}]/;

            // 연락처
            if (phone_val_checker === '') {
                $('#phone_val').addClass('border_validate_err');
                sweetalert('핸드폰 번호를 입력해주세요.', '', 'error', '닫기');
                return false;
            }
            if (phone_val_checker.search(/\s/) !== -1) {
                $('#phone_val').addClass('border_validate_err');
                sweetalert('핸드폰 번호에 공백을 제거해 주세요.', '', 'error', '닫기');
                return false;
            }

            // 이메일
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email_val_checker)) {
                $('#email_val').addClass('border_validate_err');
                sweetalert('올바른 이메일 형식을 입력해주세요.', '', 'error', '닫기');
                return false;
            }
            $('#email_val').removeClass('border_validate_err');
            if (email_val_checker === '') {
                $('#email_val').addClass('border_validate_err');
                sweetalert('이메일을 입력해주세요.', '', 'error', '닫기');
                return false;
            }
            if (email_val_checker.search(/\s/) !== -1) {
                $('#email_val').addClass('border_validate_err');
                sweetalert('이메일에 공백을 제거해 주세요.', '', 'error', '닫기');
                return false;
            }
            $('#email_val').removeClass('border_validate_err');


            // 비밀번호
            if (memPw_val_checker === '') {
                $('#memPw_val').addClass('border_validate_err');
                sweetalert('비밀번호를 입력해주세요.', '', 'error', '닫기');
                return false;
            }
            if (memPw_val_checker !== '') {
                const str = memPw_val_checker;
                if (str.search(/\s/) !== -1) {
                    $('#memPw_val').addClass('border_validate_err');
                    sweetalert('비밀번호 공백을 제거해 주세요.', '', 'error', '닫기');
                    return false;
                }
                if (!pattern1.test(str) || !pattern2.test(str) || !pattern3.test(str)
                    || str.length < 8 || str.length > 16) {
                    $('#memPw_val').addClass('border_validate_err');
                    sweetalert('8~16자 영문 대 소문자 \n 숫자, 특수문자를 사용하세요.', '', 'error', '닫기');
                    return false;
                }
            }
            $('#memPw_val').removeClass('border_validate_err');

            if (memPw_cnf_val_checker === '') {
                $('#memPw_cnf_val').addClass('border_validate_err');
                sweetalert('비밀번호 확인을 입력해주세요.', '', 'error', '닫기');
                return false;
            }
            if (memPw_val_checker !== memPw_cnf_val_checker) {
                $('#memPw_val').addClass('border_validate_err');
                $('#memPw_cnf_val').addClass('border_validate_err');
                sweetalert('비밀번호가 일치하지 않습니다.', '', 'error', '닫기');
                return false;
            }
            $('#memPw_cnf_val').removeClass('border_validate_err');
            return true;
        }

        if (fnValidate()) {
            fnSignInsert('modify', e);
        }
    };


    const memPwKeyPress = (e) => {
        $('#upw').removeClass('border_validate_err');
    };

    const memPwCnfKeyPress = (e) => {
        $('#upw_cnf_val').removeClass('border_validate_err');
    };

    const emailKeyPress = () => {
        $('#email_val').removeClass('border_validate_err');
    };

    const phoneKeyPress = () => {
        $('#phone_val').removeClass('border_validate_err');
    };


    // 이메일 수정 모달!
    const emailCk = () => {
        setIsEditingEmailOpen(true); // 이메일 수정 모달 오픈

    }

    // 모달 닫기
    const closeModal = () => {
        setIsEditingEmailOpen(false);
    };

    // 이메일 수정
    const handleEmailChange = (e) => {
        // 이메일 변경 요청
        axios.post('/api/member/modiEmail', { email, uuid }).then(() => {
            Swal.fire('이메일 변경 완료', '이메일이 성공적으로 변경되었습니다.', 'success');
        });
    };



    const sweetalert = (title, contents, icon, confirmButtonText) => {
        Swal.fire({
            title: title,
            text: contents,
            icon: icon,
            confirmButtonText: confirmButtonText
        });
    };

    const sweetalertModify = (title, contents, icon, confirmButtonText) => {
        Swal.fire({
            title: title,
            text: contents,
            icon: icon,
            confirmButtonText: confirmButtonText
        }).then(function () {
            cookie.remove('uuid', { path: '/' });
            cookie.remove('name', { path: '/' });
            cookie.remove('upw', { path: '/' });
            window.location.href = '/';
        });
    };

    // 회원 탈퇴
    const deleteMember = () => {
        sweetalertDelete('정말 탈퇴하시겠습니까?', function () {
            axios.delete('/api/member/remove', { data: { uuid } }) // axios delete 메서드에서 body 데이터를 전달하려면 `data` 사용
                .then(response => {
                    if (response.data === 'success') {
                        // 성공 메시지 출력 및 사용자 탈퇴 처리
                        Swal.fire('탈퇴 완료', '회원 탈퇴가 완료되었습니다.', 'success')
                            .then(() => {
                                // 로그아웃 처리 또는 홈 화면으로 리디렉션
                                window.location.href = '/';
                            });
                    } else {
                        // 실패 메시지 처리
                        Swal.fire('탈퇴 실패', '회원 탈퇴 중 문제가 발생했습니다.', 'error');
                    }
                })
                .catch(error => {
                    // 에러 메시지 출력 및 디버깅 정보 로그
                    console.error('탈퇴 요청 중 오류 발생:', error);
                    Swal.fire('오류 발생', '작업 중 문제가 발생했습니다. 다시 시도해주세요.', 'error');
                });
        });
    };

    // 탈퇴 알럿
    const sweetalertDelete = (title, callbackFunc) => {
        Swal.fire({
            title: title,
            text: "",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'  // 취소 버튼 텍스트 추가
        }).then((result) => {
            if (result.isConfirmed) {  // 'Yes' 버튼을 눌렀을 때만 실행
                Swal.fire(
                    '탈퇴되었습니다.',
                    '',
                    'success'
                );
                cookie.remove('uuid', { path: '/' });
                cookie.remove('name', { path: '/' });
                cookie.remove('upw', { path: '/' });
                window.location.href = '/login';
                callbackFunc(); // 'Yes' 클릭 후에만 콜백 실행
            } else if (result.isDismissed) {
                Swal.fire(
                    '취소되었습니다.',
                    '',
                    'info'
                );
            }
        });
    };

    const toggleEditEmail = () => {
        setIsEditingEmail(!isEditingEmail);
    };

    const toggleEditPhone = () => {
        setIsEditingPhone(!isEditingPhone);
    };




    return (
        <div>
            <section className="sub_wrap" >
                <article className="s_cnt re_1 ct1">
                    <div className="li_top">
                        <h2 className="s_tit1">회원정보수정</h2>
                        <form method="post" name="frm">
                            <div className="re1_wrap">
                                <div className="re_cnt ct2">
                                    <table className="table_ty1">
                                        <tr>
                                            <th>회원번호</th>
                                            <td>
                                                <input name="mno" id="mno" readOnly="readonly" value={mno} />
                                            </td>
                                        </tr>
                                        <tr className="re_email">
                                            <th>아이디</th>
                                            <td>
                                                <input name="uuid" id="uuid" readOnly="readonly" value={uuid} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>이름</th>
                                            <td>
                                                <input name="name" id="name" readOnly="readonly" value={name} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>* 연락처</th>
                                            <td>
                                                <input id="phone_val" type="text" name="phone" />

                                            </td>
                                        </tr>
                                        <tr>
                                            <th>* 이메일</th>
                                            <td>
                                                <input id="email_val" type="text" name="email" value={email ? maskEmail(email) : '정보 없음'} />
                                            </td>
                                            <button type="button" className="btn-modi" onClick={() => setIsEditingEmailOpen(true)}>수정</button>

                                        </tr>
                                        <tr>
                                            <th>* 새 비밀번호</th>
                                            <td>
                                                <input id="upw" type="password" name="upw"
                                                    placeholder="비밀번호를 입력해주세요." onKeyPress={memPwKeyPress} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>* 비밀번호 확인</th>
                                            <td>
                                                <input id="upw_cnf_val" type="password"
                                                    placeholder="비밀번호를 한번 더 입력해주세요." onKeyPress={memPwCnfKeyPress} />
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center', // 버튼을 가로로 중앙에 정렬
                                    alignItems: 'center', // 버튼을 세로로 중앙에 정렬
                                    marginTop: '20px', // 버튼 그룹 위쪽 여백
                                    alignItems: 'flex-end'
                                }}>
                                <div className="btn_confirm bt_ty bt_ty2 submit_ty1 modifyclass" type="button" onClick={(e) => submitClick('modify', e)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#004AAD', // 예시 배경색
                                        color: '#fff', // 텍스트 색상
                                    }}
                                >수정</div>
                                <div className="bt_ty bt_ty2 submit_ty1 deleteclass" type="button" onClick={(e) => deleteMember()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#d9534f', // 배경색 (삭제 버튼)
                                        color: '#fff', // 텍스트 색상
                                    }}>탈퇴</div>
                            </div>

                            {/* 비밀번호 확인 모달 */}
                            {/* <Modal
                                isOpen={isModalOpen}
                                onRequestClose={closeModal}
                                contentLabel="비밀번호 확인"
                                style={{
                                    content: {
                                        top: '50%',
                                        left: '50%',
                                        right: 'auto',
                                        bottom: 'auto',
                                        marginRight: '-50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '400px',
                                    },
                                }}
                            >
                                <h2>비밀번호 확인</h2>
                                <p>회원 탈퇴를 위해 비밀번호를 입력해주세요.</p>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="비밀번호 입력"
                                    style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                                />
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <button
                                        onClick={closeModal}
                                        style={{ marginRight: '10px', padding: '10px 20px' }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={confirmAndDelete}
                                        style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: '#fff' }}
                                    >
                                        확인
                                    </button>
                                </div>
                            </Modal> */}

                            {/* ---------------------------------------------------------------------------------------------------- */}

                            <Modal
                                isOpen={isEditingEmailOpen}
                                //onRequestClose={() => { }} // 외부 클릭으로 닫히지 않도록 비활성화
                                onRequestClose={() => console.log('모달 닫힘 방지')}
                                contentLabel="이메일 인증"
                                style={{
                                    content: {
                                        top: '50%',
                                        left: '50%',
                                        right: 'auto',
                                        bottom: 'auto',
                                        marginRight: '-50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '500px',
                                        height: '500px',
                                        alingItems: 'center',
                                    },
                                }}
                            >

                                <img
                                    style={{ width: '70px' }}
                                    src={require(`../../img/main/email.png`)}
                                    alt="메일 이미지" />
                                <h2 style={{ marginBottom: '20px', marginTop: '10px' }}>이메일 인증 절차</h2>

                                <p style={{ marginBottom: '20px' }}> <b>{name}님</b>의 회원정보 중 <b>이메일</b>을 수정하기 위해서는 인증 절차가 필요합니다.</p>

                                <hr />

                                <h3 style={{ marginTop: '20px', textAling: 'center', marginBottom: '10px' }}>{maskEmail(initialEmail)}</h3>

                                {/* 이메일이 수정 상태가 아닐 때 렌더링 | 기존 이메일 확인 단계 */}
                                {!isEditingEmail &&
                                    <div>
                                        <input
                                            type="text"
                                            // value={email}
                                            onChange={(e) => {
                                                e.preventDefault(); // 기본 동작 방지
                                                setEmail(e.target.value)
                                                console.log('입력 값:', e.target.value); // 디버깅용 로그
                                            }} // 입력값 업데이트
                                            placeholder="기존 이메일을 입력해주세요"
                                            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // 서버로 기존 이메일 확인 요청
                                                axios
                                                    .post('/api/member/emailCk', { email })
                                                    .then((response) => {
                                                        if (response.data === 0) {
                                                            Swal.fire('확인 성공', '기존 이메일이 확인되었습니다.', 'success');
                                                            setIsEditingEmail(true); // 다음 단계로 진행
                                                        } else {
                                                            Swal.fire('오류', '입력하신 이메일이 일치하지 않습니다.', 'error');
                                                        }
                                                    })
                                                    .catch(() => {
                                                        Swal.fire('오류', '이메일 확인 중 문제가 발생했습니다.', 'error');
                                                    });
                                            }}
                                            style={{ padding: '10px 20px', marginTop: '10px' }}>확인</button> {/* 확인버튼 누르면 기존 이메일과 일치하는지 확인 --> '/api/member/emailCk' */}
                                    </div>
                                }{/** 이메일이 수정 상태일 때 렌더링 | 이메일 변경 및 인증번호 확인 단계 */}

                                {isEditingEmail &&
                                    <div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="변경할 이메일을 입력해주세요"
                                                onChange={(e) => {
                                                    e.preventDefault(); // 기본 동작 방지
                                                    setEmail(e.target.value);
                                                    console.log('변경할 이메일:', e.target.value); // 디버깅용 로그
                                                }}
                                                style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                                            />
                                            <button type="button"
                                                onClick={() => {
                                                    // 서버로 이메일 인증번호 요청
                                                    axios.post('/api/mail', { email }).then(() => {
                                                        Swal.fire('인증번호 발송 완료', '입력하신 이메일로 인증번호가 발송되었습니다.', 'success');
                                                    });
                                                }}
                                                style={{ padding: '10px 20px', marginTop: '10px' }}>인증</button> {/* 인증버튼 누르면 이메일로 인증번호 발송 --> '/api/mail' */}
                                        </div>

                                        <div>
                                            <input
                                                type="text"
                                                placeholder="인증번호 입력"
                                                style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                                            />
                                        </div>
                                    </div>
                                }
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <button
                                        onClick={closeModal}
                                        style={{ marginRight: '10px', padding: '10px 20px' }}
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleEmailChange}
                                        style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: '#fff' }}
                                    >
                                        변경
                                    </button>
                                </div>
                            </Modal>
                        </form>
                    </div>
                </article>
            </section>
        </div>
    );
}

export default Modify;