import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import * as twitchService from '../services/twitch';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Fade } from "react-awesome-reveal";

const Home = ({ collapseFollowers }) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState('');

    useEffect(() => {
        if (sessionStorage.getItem('twitchToken')) {
            getGames();
        } else {
            getToken()
                .then(() => {
                    getGames();
                });
        };
        return () => sessionStorage.removeItem('twitchToken');
    }, []);

    //get Twitch token from Twitch API
    const getToken = async () => {
        try {
            let token = await twitchService.getTwitchAppToken();
            sessionStorage.setItem('twitchToken', token);
            return;
        } catch (err) {
            console.log('Error getting token: ' + err.message);
        }
    };

    //Fetch games from Twitch API
    const getGames = async () => {
        try {
            let twitchToken = sessionStorage.getItem('twitchToken');

            // If games are empty, fetch first TopGames if not use page to start fetching the next set of results
            let topGames = !games ? await twitchService.getTopGames(twitchToken, 20) : await twitchService.getMoreTopGames(twitchToken, page, 20);
            setGames(games.concat(topGames.data));
            setPage(topGames.pagination.cursor);
            let topGamesViews = await twitchService.getGameViewers(games.concat(topGames.data), twitchToken);
            setGames(topGamesViews);
        } catch (err) {
            console.log('Error fetch games: ' + err.message);
        }
    };

    //Infinite scroll to fetch more games
    const [infiniteRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage: true,
        onLoadMore: getGames,
        scrollContainer: 'parent',
    });

    //Replace static width and height with custom dimensions.
    const provideSize = (boxArtUrl) => {
        return boxArtUrl.replace('{width}x{height}', '285x380');
    };

    return (
        <Container ref={rootRef}>
            <Content show={collapseFollowers} >
                <Title>
                    <h1>Explorar</h1>
                </Title>
                <Directory>
                    <DirectoryBtn className="active">
                        Categorías
                    </DirectoryBtn>
                    <DirectoryBtn>
                        Canales en directo
                    </DirectoryBtn>
                </Directory>
                <Functions>
                    <Filter>
                        <label>Filtrar por</label>
                        <Search>
                            <input placeholder="Buscar etiquetas" />
                        </Search>
                    </Filter>
                    <Sort>
                        <label>Ordenar por</label>
                        <Search>
                            <input placeholder="Espectadores" />
                        </Search>
                    </Sort>
                </Functions>
                <TopGames >

                    {
                        games && games.map((game, index) => {
                            return (
                                <GameContent key={index} ref={infiniteRef}>
                                    <Fade>
                                        <BoxArt>
                                            <img src={provideSize(game.box_art_url)} alt="" />
                                        </BoxArt>
                                        <GameInfo>
                                            <Name>
                                                <a href="# ">
                                                    <h3>
                                                        {game.name}
                                                    </h3>
                                                </a>
                                            </Name>
                                            <Viewers>
                                                <a href="# ">
                                                    <p>
                                                        {`${game.viewers ? game.viewers : '...'} espectadores`}
                                                    </p>
                                                </a>
                                            </Viewers>
                                            <Tags>
                                                <button>
                                                    Shooter
                                            </button>
                                            </Tags>
                                        </GameInfo>
                                    </Fade>
                                </GameContent>
                            )
                        })
                    }
                </TopGames>
            </Content>
        </Container>
    )
}

export default Home;

const Container = styled.main`
    width: calc(100vw - 50px);
    height: calc(100vh - 50px);
    position: relative;
    top: 50px;
    left: 50px;
    background-color: #0e0e10;
    overflow-x: hidden;
`;

const Content = styled.div`  
    //width: 95%;
    min-height: 80vh;
    margin-left: ${({ show }) => show ? '215px' : '25px'};
    transition: margin-left 0.2s;
    margin-right: 15px;
`;

const Title = styled.div`
    margin-top: 30px;

    h1{
        font-size: 54px;
        color: white;
    }
`;

const Directory = styled.div`
    margin: 20px 0;
    display: flex;
`;

const DirectoryBtn = styled.button`
    height: 40px;
    background-color: transparent;
    border: none;
    margin-right: 20px;
    color:white;
    font-size: 18px;
    font-weight: 600;
    appearance: none;
    
    &.active,&:hover{
        color:#a970ff;
        cursor: pointer;
        border-bottom: 3px solid #a970ff;
    }
`;


//Filter & Sort components
const Filter = styled.div`
    display: flex;
    align-items: center;
    
    label{
        width: 100px;
    }
`;

const Sort = styled(Filter)`
        padding-right: 10px;
    
        label{
            width: 120px;
        }
`;

const Functions = styled.div`
    color: white;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: bold;

    @media (max-width: 768px){
        flex-direction: column;

        ${Filter}{
            margin-bottom: 10px;
        }

        ${Sort}{
        }
    }
`;


const Search = styled.div`
    //padding: 2px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;

    input{
        width: 100%;
        max-width: 220px;
        height: 30px;
        padding: 5px 10px 5px 10px;
        border-radius: 4px;
        background-color: #464648;
        appearance: none;
        outline: none;
        border: 0;
        color: white;
    }
`;


// Top Games Components
const TopGames = styled.div`
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    justify-content: center;
`;

const GameContent = styled.div`
    width : 180px ;
    max-width: 220px;
    height: 325px;
    margin: 0 10px 0 0px;
    margin-bottom: 30px;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
`;

const BoxArt = styled.div`
    background-color: #a970ff;
    width: 100%;
    height: 270px;

    img{
        width: 100%;
        height: 100%;
    }

    img:hover{
        cursor: pointer;
        transform: translate(6px,-6px);
        transition: transform 100ms ease;
    }
`;

const GameInfo = styled.div`
    color: white;
`;

const Name = styled.div`
    width: 100%;
    margin-top: 5px;

    a{
        h3{
            font-size: 14px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }

    a:hover{
        color:#a970ff;
        cursor: pointer;
    }
`;

const Viewers = styled.div`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-top: 5px;

    a{
        color: #ADADB8;
        p{
            font-size: 13px;
        }
    }

    a:hover{
        color:#a970ff;
        cursor: pointer;
    }
    
`;

const Tags = styled.div`
    margin-top: 5px;
    button{
        border: none;
        border-radius: 10px;
        padding: 3px 5px;
        background-color: #323234;
        font-size: 12px;
        color: white;
        font-weight: bold;

        &:hover{
            cursor: pointer;

        }
    }
`;