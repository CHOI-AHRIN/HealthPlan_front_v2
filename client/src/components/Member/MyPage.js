import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cookie from 'react-cookies';
import axios from 'axios';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

const MyPage = () => {

    const [uuid, setUuid] = useState(cookie.load('uuid'));
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mno, setMno] = useState('');
    const [phone, setPhone] = useState('');
    const [mtype, setMtype] = useState('');
    const [regdate, setRegdate] = useState('');
    const [sstype, setSstype] = useState('');
    const [pcount, setPcount] = useState('');

    const [authCode, setAuthCode] = useState('');
    const [authCodeInput, setAuthCodeInput] = useState('');

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingEmailOpen, setIsEditingEmailOpen] = useState(false);
    const [initialEmail, setInitialEmail] = useState(''); // 초기 이메일 상태
    const [inputEmail, setInputEmail] = useState('');

    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증완료 상태 업데이트


    const navigate = useNavigate();

    // 날짜 형식을 변환하는 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        // const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}`;  // ${hours}:${minutes}  // ${hours}:${minutes}:${seconds}
    };

    // 전화번호 포맷 변환 함수
    const formatPhoneNumber = (phone) => {
        return phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    };

    // 이메일 마스킹 함수
    const maskEmail = (email) => {
        if (!email || !email.includes('@')) {
            return '알 수 없음';
        }

        const [localPart, domainPart] = email.split('@');
        const maskedLocalPart = localPart.slice(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2));

        // 도메인 처리
        const domainParts = domainPart.split('.');
        const domainName = domainParts[0] || '';
        const domainExt = domainParts[1] || '';
        const maskedDomain = domainName.slice(0, 1) + '*'.repeat(Math.max(0, domainName.length - 1));

        return `${maskedLocalPart}@${maskedDomain}${domainExt ? '.' + domainExt : ''}`;
    };




    const callMemberInfoApi = async () => {
        try {
            // 1. 쿠키에서 토큰 가져오기
            const token = cookie.load('token');
            if (!token) {
                alert("토큰이 없습니다. 로그인해주세요.");
                return false;
            }

            // 2. token을 서버로 보내고 uuid를 받아오기
            const { data: { uuid } } = await axios.post('/api/member/loginCookie', { token });

            // 3. uuid로 회원 타입 가져오기
            const { data: mtype } = await axios.post('/api/member/searchMtype', { uuid });

            // 4. uuid로 회원 정보 조회
            const { data } = await axios.post('/api/member/read', { uuid });

            // 5. 받아온 데이터로 상태 업데이트
            setUuid(data.uuid); // 회원 아이디
            setName(data.name); // 회원 이름
            setEmail(data.email); // 회원 이메일
            setInitialEmail(data.email);
            setMtype(data.mtype || mtype); // 회원 타입 (서버에서 mtype 없으면 searchMtype 결과 사용)
            setPhone(data.phone); // 연락처
            setRegdate(formatDate(data.regdate)); // 가입 일자
            setMno(data.mno); // 회원 번호
            setSstype(data.sstype); // 구독 타입
            setPcount(data.pcount); // 잔여 포인트
        } catch (error) {
            console.error("회원 정보를 가져오는 중 오류 발생:", error);
            alert("회원 정보를 불러오는 데 실패했습니다.");
            return false;
        }
    };



    const goToMemberList = () => {
        navigate.push('/MemberList');
    };

    // 회원정보 요청 실행
    useEffect(() => {
        callMemberInfoApi(); // 컴포넌트 마운트 시 API 호출
    }, []); // 빈 배열을 전달하여 최초 한 번만 실행되도록 설정

    useEffect(() => {
        console.log('authCode 업데이트됨:', authCode);
    }, [authCode]);

    useEffect(() => {
        console.log('authCodeInput 업데이트됨', authCodeInput);
    }, [authCodeInput]);

    // 이메일 유효성 검사
    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        /* if (!emailPattern.test(email_val_checker)) {
            $('#email_val').addClass('border_validate_err');
            sweetalert('올바른 이메일 형식을 입력해주세요.', '', 'error', '닫기');
            return false;
        } */

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }



    // mtype을 변환하는 함수
    const displayMtype = () => {
        if (mtype === 't') {
            return '전문가';
        } else if (mtype === 'm') {
            return '일반회원';
        } else if (mtype === 'a') {
            return '운영자';
        } else {
            return '알 수 없는 타입'; // 다른 값이 있을 때 대비
        }
    };


    // 이메일 수정 모달!
    const emailCk = () => {
        setIsEditingEmailOpen(true); // 이메일 수정 모달 오픈

    }

    // 모달 닫기
    const closeModal = () => {
        // setIsEditingEmailOpen(false);
        setIsEditingEmailOpen(false);
        setIsEditingEmail(false);
        setAuthCode('');
        setAuthCodeInput('');
        setEmail(initialEmail); // 초기 이메일 복원
    };

    // 이메일 수정
    const handleEmailChange = async () => {

        if (!email || !validateEmail(email)) {
            Swal.fire('오류', '변경할 이메일을 올바르게 입력해주세요.', 'error');
            return;
        }

        if (authCodeInput !== authCode) {
            Swal.fire('오류', '인증을 먼저 완료해주세요.', 'error');
            return;
        }
        try {
            await axios.post('/api/member/modiEmail', { email, uuid });
            Swal.fire('이메일 변경 완료', '이메일이 성공적으로 변경되었습니다.', 'success');
            setIsEditingEmailOpen(false); // 모달 닫기
            setEmail(email); // 이메일 상태 업데이트
            setInitialEmail(email); // 초기 상태 업데이트
            navigate('/MyPage'); // 마이페이지로 이동
        } catch (error) {
            console.error('이메일 변경 중 오류 발생:', error);
            Swal.fire('오류', '이메일 변경 중 문제가 발생했습니다.', 'error');
        }
    };


    return (
        <div>
            <section className="sub_wrap" >
                <article className="s_cnt re_1 ct1">
                    <div className="li_top">
                        <h2 className="s_tit1">MyPage</h2>
                        <form method="post" name="frm">

                            <div className="re1_wrap">
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {mtype === 'a' && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            {mtype === 'a' && (
                                                <Link to="/MemberList" className="bt_ty2 submit_ty1" style={{
                                                    fontSize: '15px', width: '120px', height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex'
                                                }}>
                                                    회원관리
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 기본정보 */}
                                <div
                                    style={{ marginTop: '30px' }}
                                    className="My_info re_cnt ct2">
                                    <h3
                                        style={{ color: 'grey', fontSize: '20px' }}>기본정보</h3>

                                    <div
                                        style={{ textAlign: 'right' }}>
                                        <img
                                            style={{ width: '50px' }}
                                            src={require(`../../img/modify/coin.png`)} alt="포인트" />{pcount}p
                                    </div>

                                    <h2>{name}</h2>
                                    <h4>{uuid}</h4>
                                    <br />
                                    <hr />
                                    <br />

                                    <tr>
                                        <th>
                                            <img
                                                style={{ width: '30px' }}
                                                src={require(`../../img/modify/폰2.png`)} alt="연락처" />
                                        </th>
                                        <th
                                            style={{ textAlign: 'left' }}
                                        >{formatPhoneNumber(phone)}</th>
                                    </tr>

                                    <tr>
                                        <th><img
                                            style={{ width: '30px' }}
                                            src={require(`../../img/modify/email.png`)} alt="이메일" /></th>
                                        <th
                                            style={{ textAlign: 'left', width: '600px' }}>{maskEmail(email)}</th>
                                        <th>
                                            <button type="button" className="btn-modi" onClick={() => setIsEditingEmailOpen(true)} >수정</button>
                                        </th>
                                    </tr>
                                </div>

                                {/* 등록정보 */}
                                <div
                                    className="My_info re_cnt ct2"
                                    style={{ marginTop: '30px' }}
                                >
                                    <h3
                                        style={{ color: 'grey', fontSize: '20px' }}>등록정보</h3>
                                    <br />

                                    <tr>
                                        <th> <img
                                            style={{ width: '30px' }}
                                            src={require(`../../img/modify/가입일자.png`)} alt="달력" />
                                        </th>
                                        <th
                                            style={{ textAlign: 'left', width: '600px' }}>{regdate}</th>
                                    </tr>

                                    <tr>
                                        <th>
                                            <img
                                                style={{ width: '40px' }}
                                                src={require(`../../img/modify/type2.png`)} alt="회원타입" /></th>
                                        <th
                                            style={{ textAlign: 'left' }}>{displayMtype()}</th>

                                    </tr>

                                    <tr>
                                        <th>
                                            <img
                                                style={{ width: '30px' }}
                                                src={require(`../../img/modify/subscribe.png`)} alt="구독타입" /></th>
                                        <th
                                            style={{ textAlign: 'left' }}>{sstype}등급</th>
                                        <th>
                                            <button type="button" className="btn-modi">구독변경</button> </th>
                                    </tr>

                                </div>

                                {/* 보안 */}
                                <div
                                    className="My_info re_cnt ct2"
                                    style={{ marginTop: '30px' }}
                                >
                                    <h3
                                        style={{ color: 'grey', fontSize: '20px' }}>보안설정</h3>
                                    <br />

                                    <tr>
                                        <th> <img
                                            style={{ width: '30px' }}
                                            src={require(`../../img/modify/pw2.png`)} alt="비밀번호" />
                                        </th>
                                        <th
                                            style={{ textAlign: 'left ' }}>비밀번호</th>
                                        <th>
                                            <button type="button" className="btn-modi">수정</button>
                                        </th>
                                    </tr>

                                    <tr>
                                        <th>
                                            <img
                                                style={{ width: '30px' }}
                                                src={require(`../../img/modify/coin2.png`)} alt="회원타입" /></th>
                                        <th
                                            style={{ verticalAlign: 'middle', textAlign: 'left', width: '600px' }}>포인트 충전</th>

                                    </tr>



                                </div>

                            </div>



                            <div className="btn_confirm">
                                <Link to={'/Modify'} className="bt_ty bt_ty2 submit_ty1 modifyclass">프로필수정</Link>
                            </div>





                            <Modal
                                isOpen={isEditingEmailOpen}
                                onRequestClose={() => { }} // 모달 닫힘 방지
                                shouldCloseOnOverlayClick={false} // 외부 클릭 방지
                                shouldCloseOnEsc={false} // Esc 키 방지
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
                                            onChange={(e) => {
                                                setInputEmail(e.target.value)
                                                console.log('입력 값:', e.target.value); // 디버깅용 로그
                                            }} // 입력값 업데이트
                                            placeholder="기존 이메일을 입력해주세요"
                                            style={{ width: '80%', padding: '10px', marginTop: '10px', marginRight: '20px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // 서버로 기존 이메일 확인 요청
                                                axios
                                                    .post('/api/member/emailCk', { inputEmail })
                                                    .then((response) => {
                                                        const ok = 1;
                                                        if (response.data === ok) {
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
                                }



                                {/** 이메일이 수정 상태일 때 렌더링 | 이메일 변경 및 인증번호 확인 단계 */}

                                {isEditingEmail &&
                                    <div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="변경할 이메일을 입력해주세요"
                                                onChange={(e) => {
                                                    /*  if (!validateEmail(email)) {
                                                         Swal.fire('오류', '올바른 이메일 형식이 아닙니다.', 'error');
                                                         return;
                                                     } */
                                                    setEmail(e.target.value);
                                                    console.log('변경할 이메일:', e.target.value); // 디버깅용 로그
                                                }}
                                                style={{ width: '80%', padding: '10px', marginTop: '10px', marginRight: '20px' }}
                                            />
                                               
                                            <button type="button"
                                                onClick={() => {
                                                    if (!validateEmail(email)) {
                                                        Swal.fire('오류', '올바른 이메일 형식이 아닙니다.', 'error');
                                                        return;
                                                    }
                                                    // 서버로 이메일 인증번호 요청
                                                    axios.post('/api/mail/email', { email }).then((response) => {
                                                        setAuthCode(response.data.toString()); // 서버에서 반환된 인증번호 저장
                                                        console.log(response.data);
                                                        // console.log(authCode);
                                                        Swal.fire('인증번호 발송 완료', '입력하신 이메일로 인증번호가 발송되었습니다.', 'success');
                                                    }).catch((error) => {
                                                        console.error("API 요청 중 에러 발생:", error);
                                                        console.log("보낸 이메일:", email); // 이메일 값 확인

                                                    });
                                                }}
                                                style={{ padding: '10px 20px', marginTop: '10px' }}>인증</button> {/* 인증버튼 누르면 이메일로 인증번호 발송 --> '/api/mail' */}
                                                 <p style={{color: 'grey', fontSize: '12px'}}> * 인증번호 발송은 최대 1분 정도가 소요됩니다. 버튼을 한 번만 누르고 기다려 주세요.</p>
                                        </div>

                                        <div>
                                            <input
                                                type="text"
                                                placeholder="인증번호 입력"
                                                value={authCodeInput}
                                                onChange={(e) => setAuthCodeInput(e.target.value)}
                                                style={{ width: '69%', padding: '10px', marginTop: '10px', marginRight: '20px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {


                                                    if (authCodeInput === authCode) {
                                                        Swal.fire('인증 성공', '인증번호가 일치합니다.', 'success');
                                                        setIsEditingEmail(true); // 인증 성공 후 변경 상태로 전환
                                                        setIsEmailVerified(true); // 이메일 인증 완료 상태 설정
                                                        // setAuthCodeInput(''); // 입력 필드 초기화
                                                    } else {
                                                        Swal.fire('오류', '인증번호가 일치하지 않습니다.', 'error');
                                                        console.log("입력한 번호: " + authCodeInput + "  | 인증번호: " + authCode);
                                                    }
                                                }
                                                }
                                                style={{ padding: '10px 20px' }}
                                            >
                                                인증번호 확인
                                            </button>
                                        </div>
                                    </div>
                                }


                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <button
                                        disabled={!isEmailVerified} // 인증번호 확인 후만 활성화
                                        onClick={handleEmailChange}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: authCodeInput === authCode ? '#006eff' : '#ccc', // 조건에 따라 버튼 색상 변경
                                            color: '#fff',
                                            cursor: authCodeInput === authCode ? 'pointer' : 'not-allowed',
                                        }}
                                    >
                                        변경
                                    </button>

                                    <button
                                        onClick={closeModal}
                                        style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: '#fff' }}
                                    >
                                        취소
                                    </button>

                                </div>
                            </Modal>


                        </form>
                    </div>
                </article >
            </section >
        </div >
    );
}

export default MyPage;