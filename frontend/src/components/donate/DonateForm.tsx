import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon, X, Copy } from 'lucide-react';
import JustGiving from '@/assets/donate/DonateForm-JustGiving.svg';
import NetworkForGood from '@/assets/donate/DonateForm-NetworkForGood.svg';
import SendCheck from '@/assets/donate/DonateForm-SendACheck.svg';

const DonationForm = ({ isMobile = false, isTablet = false }) => {
    const [selectedAmount, setSelectedAmount] = useState(50);
    const [customAmount, setCustomAmount] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [frequency, setFrequency] = useState('One-time');
    const [showCheckModal, setShowCheckModal] = useState(false);

    const presetAmounts = [200, 100, 50];

    const handlePresetClick = (amount) => {
        setSelectedAmount(amount);
        setIsCustom(false);
        setCustomAmount('');
    };

    const handleOtherClick = () => {
        setIsCustom(true);
        setSelectedAmount(0);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(value);
        if (value) {
            setSelectedAmount(parseInt(value));
        }
    };

    const handleSendCheckClick = () => {
        setShowCheckModal(true);
    };

    const handleCopyAddress = () => {
        const address = `Post Office Box 58133,
Washington, D.C. 20037`;
        navigator.clipboard.writeText(address);
    };

    const displayAmount = isCustom ? (customAmount || 0) : selectedAmount;

    if (isMobile) {
        const textColor = isTablet ? 'text-gray-800' : 'text-white';
        const linkColor = isTablet ? 'text-gray-600 hover:text-secondary-yellow' : 'text-white hover:text-secondary-yellow';

        return (
            <>
                <div className="font-montserrat w-full max-w-md mx-auto">
                    <div className="mb-6 text-center">
                        <a href="#" className={`text-sm flex items-center justify-center gap-2 transition-colors ${linkColor}`}>
                            <span>Donate via Every.org using card, Apple Pay & more</span>
                        </a>
                    </div>

                    <div className="mb-6">
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {presetAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handlePresetClick(amount)}
                                    className={`px-3 py-2 text-sm border rounded transition-all duration-200 ${selectedAmount === amount && !isCustom
                                        ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md'
                                        : isTablet
                                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                            : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                                        }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                            <button
                                onClick={handleOtherClick}
                                className={`px-3 py-2 text-sm border rounded transition-all duration-200 ${isCustom
                                    ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md'
                                    : isTablet
                                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                        : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                                    }`}
                            >
                                Other
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isCustom ? (
                                <div className="flex-1 relative">
                                    <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${isTablet ? 'text-gray-500' : 'text-white/70'}`}>$</span>
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        placeholder="Enter amount"
                                        className={`w-full pl-8 pr-3 py-2 border rounded transition-all focus:outline-none ${isTablet
                                            ? 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:border-secondary-yellow'
                                            : 'bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-secondary-yellow focus:bg-white/15'
                                            }`}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={`$${selectedAmount}`}
                                    className={`flex-1 px-3 py-2 border rounded ${isTablet
                                        ? 'bg-gray-50 border-gray-300 text-gray-700'
                                        : 'bg-white/10 border-white/30 text-white'
                                        }`}
                                    readOnly
                                />
                            )}
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className={`px-3 py-2 border rounded transition-all focus:outline-none ${isTablet
                                    ? 'bg-white border-gray-300 text-gray-700 focus:border-secondary-yellow [&>option]:bg-white [&>option]:text-gray-700'
                                    : 'bg-white/10 border-white/30 text-white focus:border-secondary-yellow [&>option]:bg-white [&>option]:text-black'
                                    }`}
                            >
                                <option>One-time</option>
                                <option>Monthly</option>
                                <option>Yearly</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="secondary"
                        className="mt-4 h-14 self-start font-bold mb-4 rounded-full px-6 text-base tracking-wide flex items-center justify-center w-full"
                    >
                        <a
                            href="https://icaf.org/donate"
                            target="blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            DONATE ${displayAmount} {frequency !== 'One-time' ? frequency.toUpperCase() : 'NOW'}
                            <HeartIcon
                                strokeWidth={2}
                                className="!h-5 !w-5 stroke-black lg:!h-5 lg:!w-5"
                            />
                        </a>
                    </Button>

                    <p className={`text-xs text-center mb-6 ${textColor}`}>
                        International Child Art Foundation's Tax ID (EIN) 52-2032649
                    </p>

                    <div className="text-center">
                        <div className={`border-t-2 mb-4 ${isTablet ? 'border-gray-300' : 'border-white/30'}`}></div>
                        <h3 className={`text-sm font-semibold mb-4 ${textColor}`}>Other Donation Methods</h3>
                        <div className="flex justify-center gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                    <img src={NetworkForGood} alt="Network for Good" className="w-8 h-8 object-contain" />
                                </div>
                                <a href="#" className={`text-xs transition-colors ${linkColor}`}>
                                    Network for good
                                </a>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                    <img src={JustGiving} alt="JustGiving" className="w-8 h-8 object-contain" />
                                </div>
                                <a href="#" className={`text-xs transition-colors ${linkColor}`}>
                                    JustGiving
                                </a>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleSendCheckClick}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                    <img src={SendCheck} alt="Send a Check" className="w-8 h-8 object-contain" />
                                </button>
                                <button
                                    onClick={handleSendCheckClick}
                                    className={`text-xs transition-colors ${linkColor}`}
                                >
                                    Send a Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showCheckModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
                            <button
                                onClick={() => setShowCheckModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="text-2xl font-bold text-gray-800">CHILD ART</div>
                            </div>

                            <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                                Mail your check to ICAF
                            </h2>

                            <div className="text-center mb-6">
                                <p className="text-gray-700 leading-relaxed">
                                    Post Office Box 58133,<br />
                                    Washington, D.C. 20037
                                </p>
                            </div>

                            <button
                                onClick={handleCopyAddress}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copy to clipboard
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <div className="font-montserrat hidden md:block w-full md:w-1/2 md:pl-8 lg:pl-20 md:pr-8 lg:pr-20">
                <div className="max-w-md">
                    <div className="mb-6">
                        <a href="#" className="text-white text-sm hover:text-secondary-yellow flex items-center gap-2 transition-colors">
                            <span>Donate via Every.org using card, Apple Pay & more</span>
                        </a>
                    </div>

                    <div className="mb-6">
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {presetAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handlePresetClick(amount)}
                                    className={`px-3 py-2 text-sm border rounded transition-all duration-200 ${selectedAmount === amount && !isCustom
                                        ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md'
                                        : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                                        }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                            <button
                                onClick={handleOtherClick}
                                className={`px-3 py-2 text-sm border rounded transition-all duration-200 ${isCustom
                                    ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md'
                                    : 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                                    }`}
                            >
                                Other
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isCustom ? (
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 text-sm">$</span>
                                    <input
                                        type="text"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        placeholder="Enter amount"
                                        className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:border-secondary-yellow focus:bg-white/15 transition-all"
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={`$${selectedAmount}`}
                                    className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/70"
                                    readOnly
                                />
                            )}
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className="px-3 py-2 bg-white/10 border border-white/30 rounded text-white focus:outline-none focus:border-secondary-yellow transition-all [&>option]:bg-white [&>option]:text-black"
                            >
                                <option>One-time</option>
                                <option>Monthly</option>
                                <option>Yearly</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="secondary"
                        className="mt-4 h-14 self-start font-bold mb-4 rounded-full px-6 text-base tracking-wide flex items-center justify-center w-full"
                    >
                        <a
                            href="https://icaf.org/donate"
                            target="blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            DONATE ${displayAmount} {frequency !== 'One-time' ? frequency.toUpperCase() : 'NOW'}
                            <HeartIcon
                                strokeWidth={2}
                                className="!h-5 !w-5 stroke-black lg:!h-5 lg:!w-5"
                            />
                        </a>
                    </Button>

                    <p className="text-white text-xs text-center mb-6">
                        International Child Art Foundation's Tax ID (EIN) 52-2032649
                    </p>

                    <div className="text-center">
                        <div className="border-t-2 border-white/30 mb-4"></div>
                        <h3 className="text-white text-sm font-semibold mb-4">Other Donation Methods</h3>
                        <div className="flex justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                                    <img src={NetworkForGood} alt="Network for Good" className="w-10 h-10 object-contain" />
                                </div>
                                <a href="#" className="text-white text-xs hover:text-secondary-yellow transition-colors">
                                    Network for good
                                </a>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                                    <img src={JustGiving} alt="JustGiving" className="w-10 h-10 object-contain" />
                                </div>
                                <a href="#" className="text-white text-xs hover:text-secondary-yellow transition-colors">
                                    JustGiving
                                </a>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleSendCheckClick}
                                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 hover:bg-gray-100 transition-colors"
                                >
                                    <img src={SendCheck} alt="Send a Check" className="w-10 h-10 object-contain" />
                                </button>
                                <button
                                    onClick={handleSendCheckClick}
                                    className="text-white text-xs hover:text-secondary-yellow transition-colors"
                                >
                                    Send a Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showCheckModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
                        <button
                            onClick={() => setShowCheckModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                            Mail your check to ICAF
                        </h2>

                        <div className="text-center mb-6">
                            <p className="text-gray-700 leading-relaxed">
                                Post Office Box 58133,<br />
                                Washington, D.C. 20037
                            </p>
                        </div>

                        <button
                            onClick={handleCopyAddress}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-full font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy to clipboard
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DonationForm;