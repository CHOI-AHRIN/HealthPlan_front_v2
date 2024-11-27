import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from "axios";
import $ from 'jquery';
import cookie from 'react-cookies';

const SubscribeLList = () => {


    const [append_SboardList, setAppend_SboardList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState('');
    const [startPage, setStartPage] = useState('');
    const [endPage, setEndPage] = useState('');
    const [prev, setPrev] = useState('');
    const [next, setNext] = useState('');
    const [keyword, setKeyword] = useState('');
    const [searchtype, setSearchtype] = useState('');
    const [mtype, setMtype] = useState('');
    const [userUuid, setUserUuid] = useState('');


    useEffect(() => {
        fetchMtype(); // mtype 초기화
        callSboardListApi(currentPage);
    }, []);

    // mtype을 가져오는 함수
    const fetchMtype = async () => {
        try {
            // 쿠키에서 토큰 가져오기
            const token = cookie.load('token');

            if (token) {
                // 토큰을 서버에 보내서 로그인한 사용자의 uuid를 받아옴
                const uuidResponse = await axios.post('/api/member/loginCookie', { token });
                const userUuid = uuidResponse.data.uuid;

                setUserUuid(userUuid); // uuid를 상태로 저장

                // uuid를 사용하여 mtype을 가져옴
                const mtypeResponse = await axios.post('/api/member/searchMtype', { uuid: userUuid }); // POST 요청 본문에 uuid 전달
                setMtype(mtypeResponse.data); // 서버에서 mtype만 반환하도록 기대
                console.log("mtype Response:", mtypeResponse.data);
            } else {
                console.error("토큰이 존재하지 않습니다.");
            }
        } catch (error) {
            console.error("mtype 조회 중 오류 발생:", error);
        }
    };


    const callSboardListApi = (page) => {
        axios.get(`/api/subscribe/subscribeLessionList?page=${page}&searchType=${searchtype}&keyword=${keyword}`)
            .then(response => {
                try {
                    setAppend_SboardList(subscribeListAppend(response.data));
                    setTotalPages(response.data.pageMaker.totalCount);
                    setStartPage(response.data.pageMaker.startPage);
                    setEndPage(response.data.pageMaker.endPage);
                    setPrev(response.data.pageMaker.prev);
                    setNext(response.data.pageMaker.next);
                } catch (error) {
                    alert('작업중 오류가 발생하였습니다1.');
                }
            })
            .catch(error => { alert('작업중 오류가 발생하였습니다2.'); return false; });
    };

    const subscribeListAppend = (nBoard) => {
        let result = [];
        let nBoardList = nBoard.list;

        for (let i = 0; i < nBoardList.length; i++) {
            let data = nBoardList[i];

            var date = data.wdate;
            var year = date.substr(0, 4);
            var month = date.substr(5, 2);
            var day = date.substr(8, 2);
            var reg_date = year + '.' + month + '.' + day;

            // list num
            var num = (nBoard.pageMaker.totalCount - (nBoard.pageMaker.cri.page - 1) * nBoard.pageMaker.cri.perPageNum - i);

            result.push(
                <tr className="hidden_type">
                    <td> {num} </td>
                    <td style={{width: '100px'}}>{
                        data.titleimg != null
                            ? <img src={`/api/supload/display?fileName=${data.titleimg}`} width='35px' height='35px' />
                            : <img src={require(`../../img/layout/exerciseMan.gif`)} width='40px' height='40px' />
                    }
                    </td>
                    <td style={{width: '300px'}}><Link to={`/SubscribeLRead/${data.sno}`}>{data.title}{data.replycnt > 0 && ` [${data.replycnt}]`}</Link></td>
                    <td> {data.uuid} </td>
                    <td> {data.spoint} </td>
                    <td style={{width: '100px'}}> {data.counts} </td>
                    <td> {data.wdate} </td>
                </tr>
            )
        }
        return result;
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
        callSboardListApi(1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
        callSboardListApi(page);
    };

    const renderSearchPagination = () => {
        const pageNumbers = [];

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
                {prev == true && (
                    <button style={{ margin: 5, backgroundColor: '#6fa1dd !important' }} className="sch_bt99 wi_au" onClick={() => handlePageClick(startPage - 1)}>
                        {'<'}
                    </button>
                )}
                {pageNumbers}
                {next == true && (
                    <button style={{ margin: 5, backgroundColor: '#6fa1dd' }} className="sch_bt99 wi_au" onClick={() => handlePageClick(endPage + 1)}>
                        {'>'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <section className="sub_wrap" >
            <article className="s_cnt mp_pro_li ct1 mp_pro_li_admin">
                <div className="li_top">
                    <h2 className="s_tit1">강의수강</h2>
                </div>

                <div className="searchingForm" >
                    <form onSubmit={(e) => handleSearchButtonClick(e)}>
                        <select value={searchtype} onChange={handleSearchTypeChange} id="searchtype" className="searchzone">
                            <option value="total">전체</option>
                            <option value="TITLE">강의제목</option>
                            <option value="CONTENTS">강의내용</option>
                            <option value="uuid">강의등록</option>
                        </select>
                        <input className='search' type="text" placeholder="검색어를 입력해주세요."
                            value={keyword} onChange={handleSearchValChange} />
                        <button type="submit" className="sch_bt99 wi_au">검색</button>
                    </form>
                </div>

                <div className="list_cont list_cont_admin">
                    <table className="table_ty1 ad_slist">
                        <tr>
                            <th>번호</th>
                            <th style={{width: '100px'}}>강의이미지</th>
                            <th style={{width: '300px'}}>강의제목</th>
                            <th>강의등록</th>
                            <th>수강료</th>
                            <th style={{width: '100px'}}>조회수</th>
                            <th>등록일</th>
                        </tr>
                    </table>
                    <table id="appendNboardList" className="table_ty2 ad_slist">
                        {append_SboardList}
                    </table>
                    <div id="spaging" style={{ marginTop: '10px' }}>
                        {renderSearchPagination()}
                    </div>
                </div>
                {(mtype === 't' || userUuid === 'admin') && (
                    <div className="li_top_sch af">
                        <Link to={'/SubscribeLInsert'} className="sch_bt2 wi_au">글쓰기</Link>
                    </div>
                )}
            </article>
        </section>
    );
}

export default SubscribeLList;