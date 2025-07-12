import pageNotFound from '../imgs/404.png'
import logo from '../imgs/logo.png'
import { Link } from 'react-router-dom';
const ErrorPage = () => {
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
            <img src={pageNotFound} className='select-none border-2 border-grey w-72 aspect-square object-cover rounded' />
            <h1 className='text-4xl font-gelasio leading-7'> Page Not Found </h1>
            <p className='text-dark-grey text-xl leading-7 -mt-8 '>  The page you are looking for does not exist. Head back to <Link to="/" className="text-black-underline">HOME</Link> page</p>

            {/* <div className='mt-auto'>
                <img src={logo} className='h-8 object-contain block mx-auto select-none' />
            </div> */}
        </section>
    )
}

export default ErrorPage;