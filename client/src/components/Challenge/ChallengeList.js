import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import cookie from 'react-cookies';

const ChallengeList = () => {

    const [challenges, setChallenges] = useState([]); // 전체 챌린지 목록
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [mtype, setMtype] = useState('');
    const [rankingData, setRankingData] = useState('');
    const [searchtype, setSearchtype] = useState('');
    const [keyword, setKeyword] = useState('');
    const itemsPerPage = 3; // 페이지당 항목 수

    // 로그인한 사용자 정보를 가져오는 함수
    const fetchUserInfo = async () => {
        try {
            const token = cookie.load('token');
            if (token) {
                const response = await axios.post('/api/member/loginCookie', { token });
                const uuid = response.data.uuid;

                // 회원타입 가져오기
                const mtypeResponse = await axios.post('/api/member/searchMtype', { uuid });
                setMtype(mtypeResponse.data || '');
            } else {
                console.error("토큰이 없습니다.");
            }
        } catch (error) {
            console.error("사용자 정보를 가져오는 중 오류 발생: ", error);
        }
    };

    // 챌린지 목록 가져오기
    const fetchChallenges = async () => {
        try {
            const response = await axios.get(`/api/challenge/challengeList?searchType=${searchtype}&keyword=${keyword}`);
            const fetchedChallenges = response.data.clist || [];
            const sortedChallenges = fetchedChallenges.sort((a, b) => new Date(b.wdate) - new Date(a.wdate)); // 최신순 정렬
            setChallenges(sortedChallenges);
            setTotalPages(Math.ceil(sortedChallenges.length / itemsPerPage));
        } catch (error) {
            console.error("챌린지 목록을 가져오는 중 오류:", error);
        }
    };

    // 챌린지 랭킹 데이터 가져오기
    const fetchRankingData = async () => {
        try {
            const response = await axios.get('/api/challenge/ranking');
            setRankingData(response.data || []);
        } catch (error) {
            console.error("랭킹 데이터를 가져오는 중 오류:", error);
        }
    };

    // 최초 로드 시 데이터 가져오기
    useEffect(() => {
        fetchUserInfo();
        fetchChallenges();
        fetchRankingData();
    }, [searchtype, keyword, currentPage]);

    // 오늘의 챌린지 목록 렌더링
    const renderChallengeList = () => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        const currentChallenges = challenges.slice(startIdx, startIdx + itemsPerPage);

        return currentChallenges.map((data, index) => {
            const date = data.wdate;
            const year = date.substr(0, 4);
            const month = date.substr(5, 2);
            const day = date.substr(8, 2);
            const reg_date = `${year}.${month}.${day}`;

            // 현재 페이지와 항목 인덱스를 기반으로 순차적으로 번호를 표시
            const num = startIdx + index + 1;

            return (
                <tr className="hidden_type" key={data.bno}>
                    <td> {num} </td>
                    <td><Link to={`/ChallengeRead/${data.bno}`}>{data.title}{data.replycnt > 0 && `  [${data.replycnt}]`}</Link></td>
                    <td> {data.uuid || '조회 중..'} </td>
                    <td> {data.bcounts} </td>
                    <td> {reg_date} </td>
                </tr>
            );
        });
    };

    // 랭킹 목록 렌더링
    const renderRankingList = () => {
        if (!rankingData.length) {
            return (
                <tr>
                    <td colSpan="5">데이터가 없습니다.</td>
                </tr>
            );
        }
        return rankingData.map((data, index) => (
            <tr key={`${data.MNO}-${index}`}>
                <td>{index + 1}</td> {/* 순위 */}
                <td>{data.MNO}</td> {/* 회원번호 */}
                <td>{data.UUID}</td> {/* 아이디 */}
                <td>{data.NAME}</td> {/* 이름 */}
                <td>{data.COMMENTCOUNT}</td> {/* 인증수 (댓글 수) */}
            </tr>
        ));
    };


    const handleSearchTypeChange = (e) => {
        setSearchtype(e.target.value);
    };

    const handleSearchValChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleSearchButtonClick = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        fetchChallenges(); // 검색결과 즉시 반영
    };

    // 페이지네이션 렌더링
    const renderPagination = () => {
        const pageNumbers = [];
        const pagesToShow = 5; // 한 번에 보여줄 페이지 수

        // 페이지네이션 표시 범위 계산
        const startPage = Math.floor((currentPage - 1) / pagesToShow) * pagesToShow + 1;
        const endPage = Math.min(startPage + pagesToShow - 1, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const isCurrentPage = i === currentPage;
            pageNumbers.push(
                <button style={{ margin: 5, backgroundColor: isCurrentPage ? '#20217d' : '' }}
                    className={`sch_bt99 wi_au ${isCurrentPage ? 'current-page' : ''}`} key={i} onClick={() => handlePageClick(i)}>
                    {i}
                </button>
            );
        };
        return (
            <div className="Paging">
                {totalPages > pagesToShow && startPage > 1 && (
                    <button style={{ margin: 5 }} className="sch_bt99 wi_au" onClick={() => handlePageClick(startPage - 1)}>
                        {'<'}
                    </button>
                )}
                {pageNumbers}
                {totalPages > pagesToShow && endPage < totalPages && (
                    <button style={{ margin: 5 }} className="sch_bt99 wi_au" onClick={() => handlePageClick(endPage + 1)}>
                        {'>'}
                    </button>
                )}
            </div>
        );
    };



    return (
        <section className="sub_wrap">
            <article className="s_cnt mp_pro_li ct1 mp_pro_li_admin">
                <div className="li_top">
                    <h2 className="s_tit1">챌린지</h2>
                </div>

                <h4 className="s_tit2">오늘의 챌린지</h4>
                <div className="searchingForm">
                    <form onSubmit={(e) => handleSearchButtonClick(e)}>
                        <select value={searchtype} onChange={handleSearchTypeChange} id="searchtype" className="searchzone">
                            <option value="total">전체</option>
                            <option value="TITLE">제목</option>
                            <option value="bcontents">내용</option>
                        </select>
                        <input className='search' type="text" placeholder="검색어를 입력해주세요."
                            value={keyword} onChange={handleSearchValChange} />
                        <button type="submit" className="sch_bt99 wi_au">검색</button>
                    </form>
                </div>

                <div className="list_cont list_cont_admin">
                    <table className="table_ty1 ad_tlist">
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>조회수</th>
                            <th>작성일</th>
                        </tr>
                    </table>
                    <table id="appendChallengeList" className="table_ty2 ad_tlist">
                        {renderChallengeList()}
                    </table>
                    <div id="spaging">
                        {renderPagination()}
                    </div>
                </div>

                {mtype === 'a' && (
                    <div className="li_top_sch af">
                        <Link to={'/ChallengeInsert'} className="sch_bt2 wi_au">글쓰기</Link>
                    </div>
                )}

                {/* --------------------------------------------------------------------------------------------------------------------- */}

                {/* 챌린지 랭킹 */}
                <h4 className="s_tit2">챌린지 랭킹</h4>
                <div className="list_cont list_cont_admin">
                    <table className="table_ty1 ad_tlist2">
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>회원번호</th>
                                <th>아이디</th>
                                <th>이름</th>
                                <th>인증수</th>
                            </tr>
                        </thead>
                        <tbody id="appendChallengeRanking" className="table_ty2 ad_tlist2" style={{ marginTop: '10px' }}>
                            {renderRankingList()}
                        </tbody>
                    </table>
                </div>
            </article>
        </section>
    );
}

export default ChallengeList;
